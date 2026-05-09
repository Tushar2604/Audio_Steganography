import axios from 'axios'
import { getTokenForRequest } from './authTokenProvider'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 60000,
})

api.interceptors.request.use(async (config) => {
  const token = await getTokenForRequest()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
