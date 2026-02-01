import { AppDispatch } from "../store/store";
import { fetchWalletBalances } from "./walletService";

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
    userId: string
  ) =>
  async (dispatch: AppDispatch): Promise<ExchangeResult> => {
    try {
      const response = await fetch(
        "https://kantoronline.netlify.app/.netlify/functions/exchange-execute",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromCurrency,
            toCurrency,
            amount,
            rate,
            userId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Wystąpił błąd podczas wymiany walut.");
      }

      await dispatch(fetchWalletBalances());

      return {
        success: true,
        message: data.message || "Wymiana zakończona sukcesem!",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  };
