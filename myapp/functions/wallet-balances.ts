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
      "SELECT waluta_skrot, saldo FROM temp_balances WHERE user_id = $1 ORDER BY waluta_skrot ASC",
      [userId]
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ balances: result.rows }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
