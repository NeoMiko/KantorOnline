import { HandlerResponse, HandlerEvent } from "@netlify/functions";
import { query } from "./utils/db";

export const handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS")
    return { statusCode: 204, headers, body: "" };

  try {
    const { username, password } = JSON.parse(event.body || "{}");

    if (!username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Username i hasło są wymagane." }),
      };
    }

    const existingUser = await query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (existingUser.rows.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Użytkownik już istnieje." }),
      };
    }

    const userResult = await query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
      [username, password]
    );
    const userId = userResult.rows[0].id;

    const currencies = ["PLN", "USD", "EUR", "GBP", "CHF"];
    for (const cur of currencies) {
      await query(
        "INSERT INTO temp_balances (user_id, waluta_skrot, saldo) VALUES ($1, $2, $3)",
        [userId, cur, cur === "PLN" ? 1000 : 0]
      );
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        userId: userId.toString(),
        message: "Konto utworzone!",
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
