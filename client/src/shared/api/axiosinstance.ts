import type { AxiosError } from 'axios';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
   withCredentials: true,
});

let accessToken = '';

export function setAccessToken(token: string): void {
  accessToken = token;
}

axiosInstance.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (err: AxiosError & { config: { sent?: boolean } }) => {
    const prev = err.config;
    // Обрабатываем 401 и 403 для обновления токена
    if ((err.response?.status === 401 || err.response?.status === 403) && !prev.sent) {
      prev.sent = true;
      try {
        const response = await axios.get<{ accessToken: string }>('/api/auth/refresh', {
          withCredentials: true,
        });
        accessToken = response.data.accessToken;
        setAccessToken(accessToken);
        prev.headers.Authorization = `Bearer ${accessToken}`;
        return await axiosInstance(prev);
      } catch (refreshError) {
        // Если refresh не удался, очищаем токен
        accessToken = '';
        setAccessToken('');
        return Promise.reject(
          refreshError instanceof Error ? refreshError : new Error(String(refreshError))
        );
      }
    }

    return Promise.reject(err);
  },
);

export default axiosInstance;