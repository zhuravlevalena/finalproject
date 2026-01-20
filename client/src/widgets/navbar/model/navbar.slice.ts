import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { NavbarState } from './navbar.types';

const getInitialDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const stored = window.localStorage.getItem('theme');
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  return mediaQuery.matches;
};

const initialState: NavbarState = {
  isModalOpen: false,
  isMobileMenuOpen: false,
  isProfileOpen: false,
  isDarkMode: getInitialDarkMode(),
  searchOpen: false,
  searchValue: '',
};

const navbarSlice = createSlice({
  name: 'navbar',
  initialState,
  reducers: {
    setModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
    setProfileOpen: (state, action: PayloadAction<boolean>) => {
      state.isProfileOpen = action.payload;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      if (typeof window !== 'undefined') {
        const root = document.documentElement;
        if (action.payload) {
          root.classList.add('dark');
          window.localStorage.setItem('theme', 'dark');
        } else {
          root.classList.remove('dark');
          window.localStorage.setItem('theme', 'light');
        }
      }
    },
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.searchOpen = action.payload;
    },
    setSearchValue: (state, action: PayloadAction<string>) => {
      state.searchValue = action.payload;
    },
    closeProfileDropdown: (state) => {
      state.isProfileOpen = false;
    },
  },
});

export const {
  setModalOpen,
  setMobileMenuOpen,
  setProfileOpen,
  setDarkMode,
  setSearchOpen,
  setSearchValue,
  closeProfileDropdown,
} = navbarSlice.actions;

export default navbarSlice.reducer;
