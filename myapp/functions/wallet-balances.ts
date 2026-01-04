import { HandlerResponse } from "@netlify/functions";
import { authenticatedHandler } from "./utils/auth-middleware";
import { query } from "./utils/db";
import { Balance, Handler } from "./types/types";
import { QueryResultRow } from "pg";

const walletBalancesLogic: Handler = async (event, context) => {
  try {
    const sql = `SELECT waluta_skrot, ilosc FROM temp_balances ORDER BY waluta_skrot;`;

    const result = await query<Balance & QueryResultRow>(sql);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ balances: result.rows }),
    };
  } catch (error) {
    console.error("Błąd pobierania sald:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Błąd serwera podczas pobierania sald.",
      }),
    };
  }
};

export const handler = authenticatedHandler(walletBalancesLogic);
