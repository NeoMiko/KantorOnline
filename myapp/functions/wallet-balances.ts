import { HandlerResponse, HandlerEvent } from "@netlify/functions";
import { authenticatedHandler } from "./utils/auth-middleware";
import { query } from "./utils/db";
import { Handler } from "./types/types";

const walletHandler: Handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  try {
    const result = await query(
      "SELECT waluta_skrot, saldo FROM temp_balances ORDER BY waluta_skrot ASC"
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ balances: result.rows }),
    };
  } catch (error: any) {
    console.error("Błąd bazy danych (wallet-balances):", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Nie udało się pobrać sald z bazy danych.",
      }),
    };
  }
};

export const handler = authenticatedHandler(walletHandler);
