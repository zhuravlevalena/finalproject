import { createSlice } from "@reduxjs/toolkit";
import type { UserState } from "./user.types";
import { loginThunk, logoutThunk, refreshThunk, registerThunk, updateProfileThunk } from "./user.thunk";

const initialState: UserState = {
    user: null,
    loading: false,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Registration
    builder
      .addCase(registerThunk.fulfilled, (state) => {
        // При регистрации с подтверждением по коду, пользователь НЕ сохраняется в Redux
        // Пользователь будет сохранен только после подтверждения email
        state.user = null;
        state.loading = false;
      })
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        console.error(action.error);
        state.loading = false;
      });

      // Refresh
    builder
      .addCase(refreshThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(refreshThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshThunk.rejected, (state) => {
        // Тихая обработка - если refresh не удался (нет токена), просто не обновляем пользователя
        // Это нормальное поведение для неавторизованных пользователей
        state.user = null;
        state.loading = false;
      })

      // Login
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        console.error(action.error);
        state.loading = false;
      });

      // Logout
      builder
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addCase(logoutThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        console.error(action.error);
        state.loading = false;
      });

      // Update profile
      builder
        .addCase(updateProfileThunk.fulfilled, (state, action) => {
          state.user = action.payload;
          state.loading = false;
        })
        .addCase(updateProfileThunk.pending, (state) => {
          state.loading = true;
        })
        .addCase(updateProfileThunk.rejected, (state, action) => {
          console.error(action.error);
          state.loading = false;
        });

    },
});

export default userSlice.reducer;