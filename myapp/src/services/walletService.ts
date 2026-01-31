import { AppDispatch, RootState } from "../store/store";
import { setBalances, Balance } from "../store/slices/walletSlice";
import { API_ENDPOINTS } from "../constants/api";

interface BalancesResponse {
  balances: Balance[];
}

export const fetchWalletBalances =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setBalances({ balances: [], isLoading: true, error: null }));

    try {
      const token = getState().auth.token;
      if (!token) {
        throw new Error("Użytkownik nie jest zalogowany (brak tokena).");
      }

      const response = await fetch(API_ENDPOINTS.WALLET_BALANCES, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Błąd podczas pobierania sald.");
      }

      const data: BalancesResponse = await response.json();

      const mappedBalances: Balance[] = data.balances.map((b: any) => ({
        waluta_skrot: b.waluta_skrot,
        saldo: Number(b.saldo ?? b.ilosc ?? 0),
      }));

      dispatch(
        setBalances({
          balances: mappedBalances,
          isLoading: false,
          error: null,
        })
      );
    } catch (error: any) {
      console.error("Błąd walletService:", error.message);
      dispatch(
        setBalances({
          balances: [],
          isLoading: false,
          error: error.message,
        })
      );
    }
  };
