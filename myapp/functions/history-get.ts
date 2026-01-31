import { HandlerResponse } from "@netlify/functions";
import { authenticatedHandler } from "./utils/auth-middleware";
import { query } from "./utils/db";
import { Handler } from "./types/types";

const historyHandler: Handler = async (): Promise<HandlerResponse> => {
  try {
    const result = await query(
      `SELECT * FROM transaction_history ORDER BY data DESC LIMIT 20`
    );
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: result.rows }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Błąd pobierania historii." }),
    };
  }
};

export const handler = authenticatedHandler(historyHandler);
