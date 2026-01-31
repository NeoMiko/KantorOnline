import { createAsyncThunk } from "@reduxjs/toolkit";

interface FetchBalancesArgs {
  token: string;
  userId: string;
}

export const fetchWalletBalances = createAsyncThunk(
  "wallet/fetchBalances",
  async (args: FetchBalancesArgs, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://kantoronline.netlify.app/.netlify/functions/wallet-balances?userId=${args.userId}`,
        {
          headers: {
            Authorization: `Bearer ${args.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Błąd pobierania sald");
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
