import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

api.interceptors.request.use((config) => {
  config.headers.Accept = 'application/json'
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(new Error(error.response?.data?.message ?? 'ไม่สามารถเชื่อมต่อระบบได้')),
)

export default api
