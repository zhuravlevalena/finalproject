import { createAsyncThunk } from "@reduxjs/toolkit";
import UserService from "../api/user.service";
import type { LoginForm, RegisterForm } from "./user.types";

export const registerThunk = createAsyncThunk('user/register', async (data: RegisterForm) => {
    const user = await UserService.register(data);
    return user;
});

export const loginThunk = createAsyncThunk('user/login', async (data: LoginForm) => {
    const user = await UserService.login(data);
    return user;
});

export const refreshThunk = createAsyncThunk('user/refresh', () => UserService.refresh());

export const logoutThunk = createAsyncThunk('user/logout', () => UserService.logout());