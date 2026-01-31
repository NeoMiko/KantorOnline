import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Akcja asynchroniczna do wczytywania danych z pamięci telefonu przy starcie
export const loadAuthData = createAsyncThunk("auth/loadAuthData", async () => {
  const token = await AsyncStorage.getItem("userToken");
  const userId = await AsyncStorage.getItem("userId");
  return { token, userId };
});

const initialState: AuthState = {
  token: null,
  userId: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ token: string; userId: string }>
    ) => {
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.isAuthenticated = true;
      state.error = null;

      // Zapisujemy dane do pamięci telefonu
      AsyncStorage.setItem("userToken", action.payload.token);
      AsyncStorage.setItem("userId", action.payload.userId);
    },
    logout: (state) => {
      state.token = null;
      state.userId = null;
      state.isAuthenticated = false;

      // Czyścimy pamięć telefonu
      AsyncStorage.removeItem("userToken");
      AsyncStorage.removeItem("userId");
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  // Obsługa wczytywania danych z AsyncStorage
  extraReducers: (builder) => {
    builder
      .addCase(loadAuthData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadAuthData.fulfilled, (state, action) => {
        if (action.payload.token && action.payload.userId) {
          state.token = action.payload.token;
          state.userId = action.payload.userId;
          state.isAuthenticated = true;
        }
        state.isLoading = false;
      })
      .addCase(loadAuthData.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { loginSuccess, logout, setAuthError } = authSlice.actions;
export default authSlice.reducer;
