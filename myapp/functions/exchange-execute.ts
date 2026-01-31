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
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const exchangeHandler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
): Promise<HandlerResponse> => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Metoda niedozwolona." }),
    };
  }

  try {
    const { fromCurrency, toCurrency, amount, rate, userId } = JSON.parse(
      event.body || "{}"
    );

    if (
      !fromCurrency ||
      !toCurrency ||
      !amount ||
      amount <= 0 ||
      !rate ||
      !userId
    ) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          message: "Nieprawidłowe dane transakcji lub brak userId.",
        }),
      };
    }

    const rawAmountToReceive =
      fromCurrency === "PLN" ? amount / rate : amount * rate;
    const amountToReceive = Math.round(rawAmountToReceive * 100) / 100;

    const checkRes = await query(
      `SELECT saldo FROM temp_balances WHERE waluta_skrot = $1 AND user_id = $2`,
      [fromCurrency, userId]
    );

    const currentBalance =
      checkRes.rows.length > 0 ? Number(checkRes.rows[0].saldo) : 0;

    if (checkRes.rows.length === 0 || currentBalance < amount) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          message: `Niewystarczające środki. Posiadasz ${currentBalance} ${fromCurrency}.`,
        }),
      };
    }

    await query(
      `UPDATE temp_balances SET saldo = saldo - $1 WHERE waluta_skrot = $2 AND user_id = $3`,
      [amount, fromCurrency, userId]
    );

    await query(
      `INSERT INTO temp_balances (user_id, waluta_skrot, saldo) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id, waluta_skrot) 
       DO UPDATE SET saldo = temp_balances.saldo + EXCLUDED.saldo`,
      [userId, toCurrency, amountToReceive]
    );

    await query(
      `INSERT INTO transaction_history (user_id, typ, waluta_z, waluta_do, kwota_z, kwota_do, kurs, data) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        userId,
        "WYMIANA",
        fromCurrency,
        toCurrency,
        amount,
        amountToReceive,
        rate,
      ]
    );

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        message: "Wymiana zakończona sukcesem!",
        details: {
          sold: `${amount} ${fromCurrency}`,
          received: `${amountToReceive} ${toCurrency}`,
          rate: rate,
        },
      }),
    };
  } catch (error: any) {
    console.error("Błąd podczas wykonywania wymiany:", error.message);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Błąd serwera: " + error.message }),
    };
  }
};

export const handler = authenticatedHandler(exchangeHandler);
