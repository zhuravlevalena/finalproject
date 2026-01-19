import { createAsyncThunk } from "@reduxjs/toolkit";
import UserService from "../api/user.service";
import type { LoginForm, RegisterForm } from "./user.types";

export const registerThunk = createAsyncThunk('user/register', async (data: RegisterForm) => {
    // При регистрации с подтверждением по коду, пользователь не сохраняется в Redux
    // Пользователь будет сохранен только после подтверждения email через verifyEmailCode
    await UserService.register(data);
    return null; // Не возвращаем пользователя, чтобы не сохранять в Redux
});

export const loginThunk = createAsyncThunk('user/login', async (data: LoginForm) => {
    const result = await UserService.login(data);
    return result;
});

export const refreshThunk = createAsyncThunk(
  'user/refresh',
  async (_, { rejectWithValue }) => {
    try {
      return await UserService.refresh();
    } catch (error: any) {
      // Тихая обработка ошибок - если refresh не удался (нет токена), это нормально
      // Для неавторизованных пользователей это ожидаемое поведение
      if (error?.response?.status === 401) {
        return rejectWithValue(null);
      }
      return rejectWithValue(error);
    }
  }
);

export const logoutThunk = createAsyncThunk('user/logout', () => UserService.logout());