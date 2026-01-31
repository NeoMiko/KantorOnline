import { HandlerResponse, HandlerEvent } from "@netlify/functions";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "./utils/db";

export const handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: "Metoda niedozwolona." }),
    };
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

    const userExists = await query("SELECT id FROM users WHERE username = $1", [
      username,
    ]);

    if (userExists.rows.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: "Użytkownik o takim loginie już istnieje.",
        }),
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await query("BEGIN");

    try {
      const newUser = await query(
        "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id",
        [username, hashedPassword]
      );

      const userId = newUser.rows[0].id;

      const currencies = [
        { code: "PLN", amount: 10000 },
        { code: "USD", amount: 0 },
        { code: "EUR", amount: 0 },
        { code: "CHF", amount: 0 },
        { code: "GBP", amount: 0 },
      ];

      for (const cur of currencies) {
        await query(
          "INSERT INTO temp_balances (user_id, waluta_skrot, saldo) VALUES ($1, $2, $3)",
          [userId, cur.code, cur.amount]
        );
      }

      await query("COMMIT");

      const secret = process.env.JWT_SECRET || "temporary_secret_key_123";
      const token = jwt.sign({ userId: userId, username: username }, secret, {
        expiresIn: "1d",
      });

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          message: "Konto utworzone pomyślnie!",
          token: token,
          userId: userId,
          username: username,
        }),
      };
    } catch (dbError: any) {
      await query("ROLLBACK");
      throw dbError;
    }
  } catch (error: any) {
    console.error("BŁĄD REJESTRACJI:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Błąd serwera. Prawdopodobny problem z portfelem w bazie.",
        details: error.message,
      }),
    };
  }
};
