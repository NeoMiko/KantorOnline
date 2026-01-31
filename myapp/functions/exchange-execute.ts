import { HandlerResponse, HandlerEvent } from "@netlify/functions";
import { authenticatedHandler } from "./utils/auth-middleware";
import { query } from "./utils/db";
import { Handler } from "./types/types";

const exchangeHandler: Handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Metoda niedozwolona. Użyj POST." }),
    };
  }

  try {
    const { fromCurrency, toCurrency, amount, rate } = JSON.parse(
      event.body || "{}"
    );

    if (!fromCurrency || !toCurrency || !amount || amount <= 0 || !rate) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Nieprawidłowe dane transakcji." }),
      };
    }

    const amountToReceive =
      fromCurrency === "PLN" ? amount / rate : amount * rate;

    const checkRes = await query(
      `SELECT saldo FROM temp_balances WHERE waluta_skrot = $1`,
      [fromCurrency]
    );

    if (checkRes.rows.length === 0 || checkRes.rows[0].saldo < amount) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Niewystarczające środki w walucie ${fromCurrency}.`,
        }),
      };
    }

    await query(
      `UPDATE temp_balances SET saldo = saldo - $1 WHERE waluta_skrot = $2`,
      [amount, fromCurrency]
    );

    await query(
      `UPDATE temp_balances SET saldo = saldo + $1 WHERE waluta_skrot = $2`,
      [amountToReceive, toCurrency]
    );

    await query(
      `INSERT INTO transaction_history (typ, waluta_z, waluta_do, kwota_z, kwota_do, kurs) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
      ["WYMIANA", fromCurrency, toCurrency, amount, amountToReceive, rate]
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Wymiana zakończona sukcesem!",
        details: `Sprzedano: ${amount.toFixed(
          2
        )} ${fromCurrency}, Otrzymano: ${amountToReceive.toFixed(
          2
        )} ${toCurrency}`,
      }),
    };
  } catch (error) {
    console.error("Błąd podczas wykonywania wymiany:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Błąd serwera podczas wymiany walut." }),
    };
  }
};

export const handler = authenticatedHandler(exchangeHandler);
