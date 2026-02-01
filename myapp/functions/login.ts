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

    const result = await query(
      "SELECT id, password FROM users WHERE username = $1",
      [username]
    );
    const user = result.rows[0];

    if (!user || user.password !== password) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "Błędny login lub hasło." }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        userId: user.id.toString(),
        message: "Zalogowano!",
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
