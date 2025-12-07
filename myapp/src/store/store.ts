import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import ratesReducer from "./slices/ratesSlice";
import walletReducer from "./slices/walletSlice";
import ordersReducer from "./slices/ordersSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  rates: ratesReducer,
  wallet: walletReducer,
  orders: ordersReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
