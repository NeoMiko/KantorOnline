import { AppDispatch } from "../store/store";
import { fetchWalletBalances } from "./walletService";
import { API_ENDPOINTS } from "../constants/api";

export const executeExchange =
  (
    fromCurrency: string,
    toCurrency: string,
    amount: number,
    rate: number,
    userId: string
  ) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = await fetch(API_ENDPOINTS.EXCHANGE_EXECUTE, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromCurrency,
          toCurrency,
          amount,
          rate,
          userId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Błąd wymiany");

      await dispatch(fetchWalletBalances());
      return { success: true, message: data.message };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };
