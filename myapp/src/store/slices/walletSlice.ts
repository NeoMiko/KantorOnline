import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchWalletBalances } from "../../services/walletService"; // Dopasuj ścieżkę do swojego projektu

export interface Balance {
  waluta_skrot: string;
  saldo: number;
}

interface WalletState {
  balances: Balance[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  balances: [],
  isLoading: false,
  error: null,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    clearWallet: (state) => {
      state.balances = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Obsługa stanu ładowania
      .addCase(fetchWalletBalances.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Obsługa sukcesu - dane z serwera wpadają tutaj
      .addCase(
        fetchWalletBalances.fulfilled,
        (state, action: PayloadAction<Balance[]>) => {
          state.isLoading = false;
          state.balances = action.payload;
        }
      )
      // Obsługa błędu
      .addCase(fetchWalletBalances.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) || "Wystąpił błąd pobierania sald";
      });
  },
});

export const { clearWallet } = walletSlice.actions;
export default walletSlice.reducer;
