import { createAsyncThunk } from "@reduxjs/toolkit";

// 1. Definiujemy interfejs dla argumentów, które przekazujemy z komponentu WalletScreen
interface FetchBalancesArgs {
  token: string;
  userId: string;
}

interface Balance {
  waluta_skrot: string;
  saldo: number;
}

const API_URL = "https://kantoronline.netlify.app/.netlify/functions";

export const fetchWalletBalances = createAsyncThunk(
  "wallet/fetchBalances",

  async ({ token, userId }: FetchBalancesArgs, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/wallet-balances?userId=${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Nie udało się pobrać sald."
        );
      }

      const data = await response.json();

      return data.balances as Balance[];
    } catch (error: any) {
      return rejectWithValue(error.message || "Błąd sieci.");
    }
  }
);
