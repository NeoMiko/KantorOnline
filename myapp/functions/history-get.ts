import {
  HandlerResponse,
  HandlerEvent,
  HandlerContext,
} from "@netlify/functions";
import { authenticatedHandler } from "./utils/auth-middleware";
import { query } from "./utils/db";
import { Handler } from "./types/types";

const historyHandler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
): Promise<HandlerResponse> => {
  try {
    const userId = event.queryStringParameters?.userId;

    console.log("Otrzymano zapytanie o historię dla userId:", userId);

    if (!userId || userId === "undefined" || userId === "null") {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:
            "Brak identyfikatora użytkownika lub identyfikator nieprawidłowy.",
          receivedUserId: userId,
        }),
      };
    }

    const result = await query(
      `SELECT id, typ, waluta_z, waluta_do, kwota_z, kwota_do, kurs, data 
       FROM transaction_history 
       WHERE user_id = $1 
       ORDER BY data DESC 
       LIMIT 50`,
      [userId]
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        history: result.rows,
      }),
    };
  } catch (error: any) {
    console.error("BŁĄD HISTORY-GET:", error.message);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Błąd serwera podczas pobierania historii.",
      }),
    };
  }
};

export const handler = authenticatedHandler(historyHandler);
