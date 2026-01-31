import { HandlerResponse, HandlerEvent } from "@netlify/functions";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "./utils/db";

export const handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  try {
    const { username, password } = JSON.parse(event.body || "{}");

    if (!username || !password) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Podaj dane." }),
      };
    }

    const userExists = await query("SELECT id FROM users WHERE username = $1", [
      username,
    ]);
    if (userExists.rows.length > 0) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
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

    const secret = process.env.JWT_SECRET || "temporary_secret_key_123";
    const token = jwt.sign({ userId, username }, secret, { expiresIn: "1d" });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Konto utworzone!",
        token,
        userId: String(userId),
        username,
      }),
    };
  } catch (error: any) {
    await query("ROLLBACK").catch(() => {});
    console.error("CRASH SERWERA:", error.message);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Błąd serwera: " + error.message }),
    };
  }
};
