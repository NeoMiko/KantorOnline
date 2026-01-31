import { HandlerResponse, HandlerEvent } from "@netlify/functions";
import bcrypt from "bcryptjs";
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
      body: JSON.stringify({ message: "Method Not Allowed" }),
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
        body: JSON.stringify({ message: "Użytkownik już istnieje." }),
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Rejestracja użytkownika
    const newUser = await query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id",
      [username, hashedPassword]
    );

    try {
      const newUser = await query(
        "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id",
        [username, hashedPassword]
      );

      const userId = newUser.rows[0].id;

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: "Konto utworzone pomyślnie!",
        userId: userId,
      }),
    };
  } catch (error: any) {
    console.error("Błąd w auth-register:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Błąd serwera: " + error.message }),
    };
  }
}