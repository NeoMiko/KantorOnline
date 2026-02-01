import { AppDispatch, RootState } from "../store/store";
import { setRates, Rate } from "../store/slices/ratesSlice";

interface RatesResponse {
  date: string;
  rates: Rate[];
}

export const fetchCurrentRates = () => async (dispatch: AppDispatch) => {
  try {
    const response = await fetch(
      "https://kantoronline.netlify.app/.netlify/functions/rates-current",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Błąd pobierania kursów z serwera.");
    }

    const data: RatesResponse = await response.json();

    dispatch(setRates(data.rates));
  } catch (error: any) {
    console.error("Błąd rateService:", error.message);
  }
};
