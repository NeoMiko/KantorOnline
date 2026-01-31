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

  try {
    const { username, password } = JSON.parse(event.body || "{}");

    if (!username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Podaj dane." }),
      };
    }

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

    await query("BEGIN");
    const newUser = await query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id",
      [username, hashedPassword]
    );
    const userId = newUser.rows[0].id;

    const currencies = ["PLN", "USD", "EUR", "CHF", "GBP"];
    for (const code of currencies) {
      await query(
        "INSERT INTO temp_balances (user_id, waluta_skrot, saldo) VALUES ($1, $2, $3)",
        [userId, code, code === "PLN" ? 10000 : 0]
      );
    }
    await query("COMMIT");

    const token = jwt.sign(
      { userId, username },
      process.env.JWT_SECRET || "temporary_secret_key_123",
      { expiresIn: "1d" }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Konto utworzone!",
        token,
        userId: String(userId),
        username,
      }),
    };
  } catch (error: any) {
    await query("ROLLBACK").catch(() => {});
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Błąd serwera: " + error.message }),
    };
  }
};
