import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_ENDPOINTS } from "../constants/api";

export const fetchTransactionHistory = createAsyncThunk(
  "history/fetch",
  async (
    { token, userId }: { token: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.HISTORY_GET}?userId=${userId}`,
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
        return rejectWithValue(errorData.message || "Błąd historii");
      }

      const data = await response.json();
      return data.history;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
