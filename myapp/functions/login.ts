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

    // Proste zapytanie sprawdzające dane
    const result = await query(
      "SELECT id FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "Nieprawidłowe dane logowania." }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        userId: result.rows[0].id.toString(),
        message: "Zalogowano!",
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Błąd bazy danych: " + error.message }),
    };
  }
};
