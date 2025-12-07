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
  balances: [
    { waluta_skrot: "PLN", saldo: 15000.0 },
    { waluta_skrot: "EUR", saldo: 250.5 },
    { waluta_skrot: "USD", saldo: 100.0 },
  ],
  isLoading: false,
  error: null,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setBalances: (state, action: PayloadAction<Balance[]>) => {
      state.balances = action.payload;
    },
  },
});

export const { setBalances } = walletSlice.actions;
export default walletSlice.reducer;
