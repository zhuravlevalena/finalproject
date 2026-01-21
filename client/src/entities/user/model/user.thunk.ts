import { createAsyncThunk } from '@reduxjs/toolkit';
import UserService from '../api/user.service';
import type { LoginForm, RegisterForm, User } from './user.types';

type RejectValue = null | unknown;

export const registerThunk = createAsyncThunk<undefined, RegisterForm>(
  'user/register',
  async (data) => {
    // При регистрации с подтверждением по коду, пользователь не сохраняется в Redux
    await UserService.register(data);
    return undefined;
  },
);

export const loginThunk = createAsyncThunk<User, LoginForm>(
  'user/login',
  async (data) => {
    return await UserService.login(data);
  },
);

export const refreshThunk = createAsyncThunk<User, undefined, { rejectValue: RejectValue }>(
  'user/refresh',
  async (_arg, { rejectWithValue }) => {
    try {
      return await UserService.refresh();
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;

      // если refresh не удался (нет токена) — это нормальный кейс для гостя
      if (status === 401) {
        return rejectWithValue(null);
      }

      return rejectWithValue(error);
    }
  },
);

export const logoutThunk = createAsyncThunk<undefined, undefined>(
  'user/logout',
  async () => {
    await UserService.logout();
    return undefined;
  },
);

export const updateProfileThunk = createAsyncThunk<
  User,
  {
    name?: string;
    birthDate?: string | null;
    gender?: string | null;
    phone?: string | null;
    email?: string;
  }
>('user/updateProfile', async (data) => {
  return await UserService.updateProfile(data);
});