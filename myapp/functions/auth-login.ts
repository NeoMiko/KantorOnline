import { HandlerResponse, HandlerEvent } from "@netlify/functions";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "./utils/db";

export const handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Użyj POST" }),
      };
    }

    console.log("Otrzymano body:", event.body);

    const { username, password } = JSON.parse(event.body || "{}");

    if (!username || !password) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Brak danych" }),
      };
    }

    const res = await query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (res.rows.length === 0) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Użytkownik nie istnieje." }),
      };
    }

    const user = res.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Błędne hasło." }),
      };
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || "twoj_staly_klucz_123",
      { expiresIn: "1d" }
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        userId: String(user.id),
        username: user.username,
      }),
    };
  } catch (error: any) {
    console.error("CRITICAL ERROR:", error.message);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Błąd bazy danych",
        error: error.message,
      }),
    };
  }
};
