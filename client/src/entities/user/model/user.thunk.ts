import { createAsyncThunk } from '@reduxjs/toolkit';
import UserService from '../api/user.service';
import type { LoginForm, RegisterForm, User } from './user.types';

type RejectValue = unknown;

export const registerThunk = createAsyncThunk<undefined, RegisterForm>(
  'user/register',
  async (data) => {
  
    await UserService.register(data);
    return undefined;
  },
);

export const loginThunk = createAsyncThunk<User, LoginForm>(
  'user/login',
  async (data) => await UserService.login(data)
);

export const refreshThunk = createAsyncThunk<User, undefined, { rejectValue: RejectValue }>(
  'user/refresh',
  async (_arg, { rejectWithValue }) => {
    try {
      return await UserService.refresh();
    } catch (error) {
      const errorWithResponse = error as { response?: { status?: number } };
      const status = errorWithResponse.response?.status;

     
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
>('user/updateProfile', async (data) => await UserService.updateProfile(data));