import json
import os
import time
from urllib.request import urlopen

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt

bearer_scheme = HTTPBearer(auto_error=False)
_jwks_cache = {"keys": [], "fetched_at": 0.0}
_JWKS_TTL_SECONDS = 300


def _get_jwks_url() -> str:
    explicit = os.getenv("CLERK_JWKS_URL", "").strip()
    if explicit:
        return explicit

    issuer = os.getenv("CLERK_ISSUER", "").strip().rstrip("/")
    if issuer:
        return f"{issuer}/.well-known/jwks.json"

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Clerk is not configured. Set CLERK_JWKS_URL or CLERK_ISSUER.",
    )


def _fetch_jwks():
    now = time.time()
    if _jwks_cache["keys"] and (now - _jwks_cache["fetched_at"] < _JWKS_TTL_SECONDS):
        return _jwks_cache["keys"]

    with urlopen(_get_jwks_url(), timeout=5) as response:
        payload = json.loads(response.read().decode("utf-8"))
        keys = payload.get("keys", [])
        _jwks_cache["keys"] = keys
        _jwks_cache["fetched_at"] = now
        return keys


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    token = credentials.credentials
    try:
        headers = jwt.get_unverified_header(token)
        kid = headers.get("kid")
        if not kid:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token header")

        keys = _fetch_jwks()
        key_data = next((k for k in keys if k.get("kid") == kid), None)
        if not key_data:
            _jwks_cache["keys"] = []
            keys = _fetch_jwks()
            key_data = next((k for k in keys if k.get("kid") == kid), None)
            if not key_data:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unknown token key")

        claims = jwt.decode(
            token,
            key_data,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )

        user_id = claims.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        return user_id
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logging.warning(f"JWT validation error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Token error: {type(e).__name__}: {e}")
