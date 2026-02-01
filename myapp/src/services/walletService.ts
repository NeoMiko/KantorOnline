import { AppDispatch, RootState } from "../store/store";
import { setBalances, Balance } from "../store/slices/walletSlice";
import { API_ENDPOINTS } from "../constants/api";

export const fetchWalletBalances =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setBalances({ balances: [], isLoading: true, error: null }));

    try {
      const userId = getState().auth.userId;
      if (!userId) {
        throw new Error("Brak ID użytkownika. Zaloguj się ponownie.");
      }

      const response = await fetch(API_ENDPOINTS.WALLET_BALANCES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Błąd podczas pobierania sald.");
      }

      const data = await response.json();

      const mappedBalances: Balance[] = data.balances.map((b: any) => ({
        waluta_skrot: b.waluta_skrot,
        saldo: Number(b.saldo ?? 0),
      }));

      dispatch(
        setBalances({
          balances: mappedBalances,
          isLoading: false,
          error: null,
        })
      );
    } catch (error: any) {
      dispatch(
        setBalances({
          balances: [],
          isLoading: false,
          error: error.message,
        })
      );
    }
  };
