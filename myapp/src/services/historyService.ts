import { createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = "https://kantoronline.netlify.app/.netlify/functions";

export const fetchTransactionHistory = createAsyncThunk(
  "history/fetch",
  async (
    { token, userId }: { token: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_URL}/history-get?userId=${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Błąd historii");
      }

      return data.history;
    } catch (error: any) {
      return rejectWithValue(error.message || "Błąd sieci");
    }
  }
);
