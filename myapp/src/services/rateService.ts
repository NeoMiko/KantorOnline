import { AppDispatch, RootState } from "../store/store";
import { setRates, Rate } from "../store/slices/ratesSlice";
import { API_ENDPOINTS } from "../constants/api";

interface RatesResponse {
  date: string;
  rates: Rate[];
}

export const fetchCurrentRates =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      // 1. Pobieranie tokena autoryzacji z Reduxa
      const token = getState().auth.token;
      if (!token) {
        console.warn("Brak tokena autoryzacji. Pomiń pobieranie kursów.");
        return;
      }

      console.log("Pobieranie kursów z:", API_ENDPOINTS.RATES_CURRENT);

      const response = await fetch(API_ENDPOINTS.RATES_CURRENT, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Błąd pobierania kursów z serwera."
        );
      }

      const data: RatesResponse = await response.json();

      // 2. Zapis pobranych kursów do Reduxa
      dispatch(setRates(data.rates));
      console.log("Kursy pomyślnie zaktualizowane.");
    } catch (error) {
      // Obsługa błędów sieci i API
      console.error("Błąd API podczas pobierania kursów:", error);
    }
  };
