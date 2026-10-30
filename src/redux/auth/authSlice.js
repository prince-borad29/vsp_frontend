import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Helper function to decode JWT claims without external libraries
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const token = localStorage.getItem('token');
const initialUser = token ? parseJwt(token) : null;

// Async thunk for Login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      return response.data; // { token, user: { id, name, email, role } }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Async thunk for Registration
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser, // Automatically populated from localStorage on refresh!
    token: token,
    isAuthenticated: !!token,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUserDetails: (state, action) => {
            if (state.user) {
                // 1. Update the user state
                state.user = {
                    ...state.user,
                    name: action.payload.name,
                    email: action.payload.email
                };
                
                // 2. Overwrite the old JWT with the fresh one!
                if (action.payload.token) {
                    state.token = action.payload.token;
                    localStorage.setItem('token', action.payload.token);
                }

                // 3. (Optional) If you also store the raw user object in localStorage
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser) {
                    localStorage.setItem('user', JSON.stringify({
                        ...storedUser,
                        name: action.payload.name,
                        email: action.payload.email
                    }));
                }
            }
        },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError , updateUserDetails} = authSlice.actions;
export default authSlice.reducer;