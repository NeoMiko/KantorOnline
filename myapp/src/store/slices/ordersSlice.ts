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
  pendingOrders: [],
  history: [],
  isLoading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    fetchOrdersStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setOrders: (state, action: PayloadAction<Order[]>) => {
      // Rozdzielamy zlecenia na aktywne i historyczne
      state.pendingOrders = action.payload.filter(
        (o) => o.status === "OCZEKUJACE"
      );
      state.history = action.payload.filter((o) => o.status !== "OCZEKUJACE");
      state.isLoading = false;
    },
    fetchOrdersError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    removeOrder: (state, action: PayloadAction<number>) => {
      state.pendingOrders = state.pendingOrders.filter(
        (o) => o.id !== action.payload
      );
    },
  },
});

export const { setOrders, fetchOrdersStart, fetchOrdersError, removeOrder } =
  ordersSlice.actions;

export default ordersSlice.reducer;
