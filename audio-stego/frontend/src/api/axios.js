import axios from 'axios'
import { getTokenForRequest } from './authTokenProvider'

const api = axios.create({
  baseURL:import.meta.env.VITE_API_UR,
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
