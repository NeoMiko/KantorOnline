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
  // Startowe wartości
  rates: [
    { waluta_skrot: "USD", kurs_kupna: 4.1, kurs_sprzedazy: 4.15 },
    { waluta_skrot: "EUR", kurs_kupna: 4.5, kurs_sprzedazy: 4.55 },
    { waluta_skrot: "GBP", kurs_kupna: 5.1, kurs_sprzedazy: 5.2 },
  ],
  lastUpdated: null,
  isLoading: false,
  error: null,
};

const ratesSlice = createSlice({
  name: "rates",
  initialState,
  reducers: {
    // Wywołaj to w rateService przed fetchem
    fetchRatesStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    // Wywołaj to po sukcesie
    setRates: (state, action: PayloadAction<Rate[]>) => {
      state.rates = action.payload;
      state.lastUpdated = new Date().toISOString();
      state.isLoading = false;
      state.error = null;
    },
    // Wywołaj to przy błędzie
    fetchRatesError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const { setRates, fetchRatesStart, fetchRatesError } =
  ratesSlice.actions;
export default ratesSlice.reducer;
