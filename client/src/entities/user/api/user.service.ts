import axiosInstance, { setAccessToken } from '@/shared/api/axiosinstance';
import axios from 'axios';
import { AuthResponseSchema } from '../model/user.schemas';
import type { LoginForm, RegisterForm, User } from '../model/user.types';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class UserService {
  static async register(data: RegisterForm): Promise<void> {
    await axios.post('/api/auth/register', data);
  }

  static async login(data: LoginForm): Promise<User> {
    const response = await axios.post('/api/auth/login', data);
    const { user, accessToken } = AuthResponseSchema.parse(response.data);
    setAccessToken(accessToken);
    return user;
  }

  static async verifyEmail(
    token: string,
  ): Promise<{ success: boolean; message: string; user: User }> {
    const response = await axiosInstance.get<{ success: boolean; message: string; user: User }>(
      `/auth/verify-email?token=${token}`,
    );
    return response.data;
  }

  static async verifyEmailCode(
    email: string,
    code: string,
  ): Promise<{ success: boolean; message: string; user: User; accessToken: string }> {
    const response = await axios.post<{
      success: boolean;
      message: string;
      user: User;
      accessToken: string;
    }>('/api/auth/verify-email-code', { email, code });
    const { accessToken } = response.data;
    setAccessToken(accessToken);
    return response.data;
  }

  static async resendVerificationCode(email: string): Promise<void> {
    await axios.post('/api/auth/resend-verification-code', { email });
  }

  static async resendVerificationEmail(): Promise<void> {
    await axiosInstance.post('/auth/resend-verification');
  }

  static async refresh(): Promise<User> {
  const response = await axios.get('/api/auth/refresh', {
    withCredentials: true,
  });
  const { user, accessToken } = AuthResponseSchema.parse(response.data);
  setAccessToken(accessToken);
  return user;
}

  static async logout(): Promise<void> {
    await axiosInstance.delete('/auth/logout');
    setAccessToken('');
  }

  static googleAuth(): void {
    window.location.href = '/api/auth/google';
  }

  static async updateProfile(data: {
    name?: string;
    birthDate?: string | null;
    gender?: string | null;
    phone?: string | null;
    email?: string;
  }): Promise<User> {
    const response = await axiosInstance.put<User>('/users/me', data);
    return response.data;
  }
}

export default UserService;