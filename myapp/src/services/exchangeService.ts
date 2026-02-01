import { AppDispatch } from "../store/store";
import { fetchWalletBalances } from "./walletService";
import { API_ENDPOINTS } from "../constants/api";

interface ExchangeResult {
  success: boolean;
  message: string;
}

export const executeExchange =
  (
    fromCurrency: string,
    toCurrency: string,
    amount: number,
    rate: number,
    token: string,
    userId: string
  ) =>
  async (dispatch: AppDispatch): Promise<ExchangeResult> => {
    try {
      const response = await fetch(API_ENDPOINTS.EXCHANGE_EXECUTE, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromCurrency,
          toCurrency,
          amount,
          rate,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Wystąpił błąd podczas wymiany walut.");
      }

      await dispatch(fetchWalletBalances({ token, userId }));

      return {
        success: true,
        message: data.message || "Wymiana zakończona sukcesem!",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Nie udało się połączyć z serwerem.",
      };
    }
  };
