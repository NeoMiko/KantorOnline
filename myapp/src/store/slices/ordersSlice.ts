import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Order {
  id: number;
  waluta_skrot: string;
  typ: "KUPNO" | "SPRZEDAZ";
  kwota: number;
  kurs_docelowy: number;
  status: "OCZEKUJACE" | "ZREALIZOWANE" | "ANULOWANE";
  data_utworzenia: string;
}

interface OrdersState {
  pendingOrders: Order[];
  history: Order[];
  isLoading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  pendingOrders: [
    {
      id: 1,
      waluta_skrot: "EUR",
      typ: "KUPNO",
      kwota: 500,
      kurs_docelowy: 4.52,
      status: "OCZEKUJACE",
      data_utworzenia: new Date().toISOString(),
    },
  ],
  history: [
    {
      id: 2,
      waluta_skrot: "USD",
      typ: "SPRZEDAZ",
      kwota: 200,
      kurs_docelowy: 4.12,
      status: "ZREALIZOWANE",
      data_utworzenia: new Date().toISOString(),
    },
  ],
  isLoading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.pendingOrders = action.payload.filter(
        (o) => o.status === "OCZEKUJACE"
      );
      state.history = action.payload.filter((o) => o.status !== "OCZEKUJACE");
    },
  },
});

export const { setOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
