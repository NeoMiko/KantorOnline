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
      const { token } = getState().auth;

      if (!token) {
        console.warn(
          "Brak tokena – nie można pobrać kursów (wymagana autoryzacja)."
        );
        return;
      }

      const response = await fetch(API_ENDPOINTS.RATES_CURRENT, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Obsługa błędów 401, 404, 500
        const errorText = await response.text();
        let errorMessage = "Błąd pobierania kursów.";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data: RatesResponse = await response.json();

      if (data && data.rates) {
        dispatch(setRates(data.rates));
      }
    } catch (error) {
      console.error("Błąd fetchCurrentRates:", error);
    }
  };
