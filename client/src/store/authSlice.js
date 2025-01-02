import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

const isTokenValid = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch (e) {
    return false;
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: (() => {
      const token = localStorage.getItem('access_token');
      return token && isTokenValid(token);
    })(),
  },
  reducers: {
    login: (state) => {
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      localStorage.removeItem('access_token');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
