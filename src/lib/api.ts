import axios from "axios"
import { getToken, removeToken } from "./auth"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL_API,
})

// adicionar token nas request
api.interceptors.request.use(
 async (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// quando a request for 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export default api

