import { useAppSelector, useAppDispatch } from '@/shared/lib/hooks';
import { loginThunk, registerThunk, logoutThunk } from '@/entities/user/model/user.thunk';
import type { LoginForm, RegisterForm } from '@/entities/user/model/user.types';

export function useAuth() {
  const user = useAppSelector((state) => state.user.user);
  const isLoading = useAppSelector((state) => state.user.loading);
  const dispatch = useAppDispatch();

  const login = async (data: LoginForm) => {
    const result = await dispatch(loginThunk(data));
    if (loginThunk.fulfilled.match(result)) {
      return result.payload;
    }
    throw result.error;
  };

  const register = async (data: RegisterForm) => {
    const result = await dispatch(registerThunk(data));
    if (registerThunk.fulfilled.match(result)) {
      return result.payload;
    }
    throw result.error;
  };

  const logout = async () => {
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

