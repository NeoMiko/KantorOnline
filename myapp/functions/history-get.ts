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

const historyHandler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
): Promise<HandlerResponse> => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  try {
    const userId = event.queryStringParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Brak identyfikatora użytkownika." }),
      };
    }

    const result = await query(
      `SELECT 
        id, 
        waluta_sprzedawana AS waluta_z, 
        ilosc_sprzedana AS kwota_z, 
        waluta_kupowana AS waluta_do, 
        ilosc_kupiona AS kwota_do, 
        kurs_wymiany AS kurs, 
        data_transakcji AS data 
       FROM history 
       WHERE user_id = $1 
       ORDER BY data_transakcji DESC 
       LIMIT 50`,
      [userId]
    );

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        history: result.rows,
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

export const handler = authenticatedHandler(historyHandler);
