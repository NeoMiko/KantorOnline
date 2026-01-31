import { HandlerResponse, HandlerEvent } from "@netlify/functions";
import bcrypt from "bcryptjs";
import { query } from "./utils/db";

export const handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  // Nagłówki CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  try {
    const { username, password } = JSON.parse(event.body || "{}");

    if (!username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Podaj login i hasło." }),
      };
    }

    // Sprawdź czy użytkownik istnieje
    const userExists = await query("SELECT id FROM users WHERE username = $1", [
      username,
    ]);
    if (userExists.rows.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Użytkownik już istnieje." }),
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Zapis do bazy
    const newUser = await query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id",
      [username, hashedPassword]
    );

    const userId = newUser.rows[0].id;

    // Dodaj 10 000 PLN na start
    await query(
      "INSERT INTO temp_balances (user_id, waluta_skrot, saldo) VALUES ($1, $2, $3)",
      [userId, "PLN", 10000]
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ message: "Konto utworzone pomyślnie!" }),
    };
  } catch (error: any) {
    console.error("Błąd w auth-register:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Błąd serwera: " + error.message }),
    };
  }
};
