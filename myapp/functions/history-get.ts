import { HandlerResponse, HandlerEvent } from "@netlify/functions";
import { query } from "./utils/db";

export const handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Użyj POST z userId" }),
    };
  }

  try {
    const { userId } = JSON.parse(event.body || "{}");

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Brak userId" }),
      };
    }

    const result = await query(
      `SELECT * FROM transaction_history WHERE user_id = $1 ORDER BY data DESC LIMIT 20`,
      [userId]
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: result.rows }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
