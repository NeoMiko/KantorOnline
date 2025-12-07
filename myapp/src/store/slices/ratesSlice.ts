import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Rate {
  waluta_skrot: string;
  kurs_kupna: number;
  kurs_sprzedazy: number;
}

interface RatesState {
  rates: Rate[];
  lastUpdated: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RatesState = {
  rates: [
    { waluta_skrot: "USD", kurs_kupna: 4.1, kurs_sprzedazy: 4.15 },
    { waluta_skrot: "EUR", kurs_kupna: 4.5, kurs_sprzedazy: 4.55 },
    { waluta_skrot: "CHF", kurs_kupna: 4.6, kurs_sprzedazy: 4.65 },
  ],
  lastUpdated: new Date().toISOString(),
  isLoading: false,
  error: null,
};

const ratesSlice = createSlice({
  name: "rates",
  initialState,
  reducers: {
    setRates: (state, action: PayloadAction<Rate[]>) => {
      state.rates = action.payload;
      state.lastUpdated = new Date().toISOString();
      state.isLoading = false;
    },
  },
});

export const { setRates } = ratesSlice.actions;
export default ratesSlice.reducer;
