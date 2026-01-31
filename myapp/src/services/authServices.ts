import { AppDispatch } from "../store/store";
import { loginSuccess, setAuthError } from "../store/slices/authSlice";
import { API_ENDPOINTS } from "../constants/api";

export const loginUser =
  (email: string, haslo: string) => async (dispatch: AppDispatch) => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, haslo }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Błąd logowania.");
      }

      // Zapisujemy token i userId w Redux
      dispatch(
        loginSuccess({
          token: data.token,
          userId: data.userId,
        })
      );

      return { success: true };
    } catch (error: any) {
      dispatch(setAuthError(error.message));
      return { success: false, message: error.message };
    }
  };

export const registerUser =
  (email: string, haslo: string) => async (dispatch: AppDispatch) => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH_REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, haslo }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Błąd rejestracji.");
      }

      dispatch(
        loginSuccess({
          token: data.token,
          userId: data.userId,
        })
      );

      return { success: true };
    } catch (error: any) {
      dispatch(setAuthError(error.message));
      return { success: false, message: error.message };
    }
  };
