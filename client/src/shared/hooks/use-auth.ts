import { useAppSelector, useAppDispatch } from '@/shared/lib/hooks';
// eslint-disable-next-line fsd-layers/no-import-from-top
import { loginThunk, registerThunk, logoutThunk } from '@/entities/user/model/user.thunk';
import type { LoginForm, RegisterForm, User } from '@/entities/user/model/user.types';

export function useAuth(): {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginForm) => Promise<User>;
  register: (data: RegisterForm) => Promise<undefined>;
  logout: () => Promise<void>;
  isLoggingIn: boolean;
  isRegistering: boolean;
} {
  const user = useAppSelector((state) => state.user.user);
  const isLoading = useAppSelector((state) => state.user.loading);
  const dispatch = useAppDispatch();

  const login = async (data: LoginForm): Promise<User> => {
    const result = await dispatch(loginThunk(data));
    if (loginThunk.fulfilled.match(result)) {
      return result.payload;
    }
    const { error } = result;
    if (error instanceof Error) {
      throw error;
    }
    const errorMessage = 
      (error as { message?: string } | undefined)?.message ?? 
      (typeof error === 'string' ? error : 'Login failed');
    throw new Error(errorMessage);
  };

  const register = async (data: RegisterForm): Promise<undefined> => {
    const result = await dispatch(registerThunk(data));
    if (registerThunk.fulfilled.match(result)) {
      return result.payload;
    }
    const { error } = result;
    if (error instanceof Error) {
      throw error;
    }
    const errorMessage = 
      (error as { message?: string } | undefined)?.message ?? 
      (typeof error === 'string' ? error : 'Registration failed');
    throw new Error(errorMessage);
  };

  const logout = async (): Promise<void> => {
    await dispatch(logoutThunk());
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    isLoggingIn: isLoading,
    isRegistering: isLoading,
  };
}