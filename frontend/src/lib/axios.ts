import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

api.interceptors.request.use((config) => {
  config.headers.Accept = 'application/json'
  return config
})

// แนบ body ของ response ไว้ที่ error ด้วย เผื่อหน้าไหนต้องใช้รายละเอียดมากกว่าข้อความเดียว
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data
    return Promise.reject(Object.assign(new Error(data?.message ?? 'ไม่สามารถเชื่อมต่อระบบได้'), { data }))
  },
)

export default api
