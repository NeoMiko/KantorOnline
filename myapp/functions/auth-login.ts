import { HandlerResponse, HandlerEvent } from "@netlify/functions";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "./utils/db";

export const handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: "Metoda niedozwolona" }),
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Brak danych w żądaniu" }),
      };
    }

    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Login i hasło są wymagane" }),
      };
    }

    const res = await query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (res.rows.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "Nieprawidłowy login lub hasło." }),
      };
    }

    const user = res.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "Nieprawidłowy login lub hasło." }),
      };
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || "secret_klucz_do_zmiany",
      { expiresIn: "1d" }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token,
        username: user.username,
        userId: user.id,
      }),
    };
  } catch (error: any) {
    console.error("Błąd w auth-login:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Błąd serwera",
        error: error.message,
      }),
    };
  }
};
