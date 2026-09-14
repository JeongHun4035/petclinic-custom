import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status ?? 500
    const message = error.response?.data?.message ?? error.message ?? 'Axios Error'

    console.error('[AXIOS ERROR]', status, message)

    return Promise.reject({
      status,
      message,
    })
  },
)

export const axiosRequest = {
  get<T>(url: string, config?: AxiosRequestConfig) {
    return instance.get<T>(url, config)
  },
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return instance.post<T>(url, data, config)
  },
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return instance.put<T>(url, data, config)
  },
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return instance.patch<T>(url, data, config)
  },
  delete<T>(url: string, config?: AxiosRequestConfig) {
    return instance.delete<T>(url, config)
  },
}

export default instance
