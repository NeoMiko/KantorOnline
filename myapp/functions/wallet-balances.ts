import { HandlerResponse } from "@netlify/functions";
import { authenticatedHandler } from "./utils/auth-middleware";
import { query } from "./utils/db";
import { Handler } from "./types/types";

const walletHandler: Handler = async (): Promise<HandlerResponse> => {
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
    console.error("BŁĄD WALLET-BALANCES:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

export const handler = authenticatedHandler(walletHandler);
