import {
  HandlerResponse,
  HandlerEvent,
  HandlerContext,
} from "@netlify/functions";
import { authenticatedHandler } from "./utils/auth-middleware";
import { query } from "./utils/db";
import { Handler } from "./types/types";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const walletHandler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
): Promise<HandlerResponse> => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: "",
    };
  }

  try {
    const userId = event.queryStringParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Brak userId w zapytaniu." }),
      };
    }

    const result = await query(
      "SELECT waluta_skrot, saldo FROM temp_balances WHERE user_id = $1 ORDER BY waluta_skrot ASC",
      [userId]
    );

    return {
      statusCode: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ balances: result.rows }),
    };
  } catch (error: any) {
    console.error("BŁĄD WALLET-BALANCES:", error.message);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Błąd serwera: " + error.message }),
    };
  }
};

export const handler = authenticatedHandler(walletHandler);
