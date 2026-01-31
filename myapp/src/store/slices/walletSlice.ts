import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
    setBalances: (
      state,
      action: PayloadAction<{
        balances: Balance[];
        isLoading: boolean;
        error: string | null;
      }>
    ) => {
      state.balances = action.payload.balances;
      state.isLoading = action.payload.isLoading;
      state.error = action.payload.error;
    },
  },
});

export const { setBalances } = walletSlice.actions;
export default walletSlice.reducer;
