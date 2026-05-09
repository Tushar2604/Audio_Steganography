let tokenProvider = null

export function setTokenProvider(provider) {
  tokenProvider = provider
}

export async function getTokenForRequest() {
  if (!tokenProvider) return null
  try {
    return await tokenProvider()
  } catch {
    return null
  }
}
