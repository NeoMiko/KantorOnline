import { HandlerResponse, HandlerEvent } from "@netlify/functions";
import { query } from "./utils/db";

export const handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Metoda niedozwolona. Użyj POST." }),
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
        body: JSON.stringify({
          message: "Nieprawidłowe dane transakcji lub brak ID użytkownika.",
        }),
      };
    }

    const amountToReceive =
      fromCurrency === "PLN" ? amount / rate : amount * rate;

    const checkRes = await query(
      `SELECT saldo FROM temp_balances WHERE waluta_skrot = $1 AND user_id = $2`,
      [fromCurrency, userId]
    );

    if (checkRes.rows.length === 0 || Number(checkRes.rows[0].saldo) < amount) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Niewystarczające środki w walucie ${fromCurrency}.`,
        }),
      };
    }

    await query(
      `UPDATE temp_balances SET saldo = saldo - $1 WHERE waluta_skrot = $2 AND user_id = $3`,
      [amount, fromCurrency, userId]
    );

    await query(
      `UPDATE temp_balances SET saldo = saldo + $1 WHERE waluta_skrot = $2 AND user_id = $3`,
      [amountToReceive, toCurrency, userId]
    );

    await query(
      `INSERT INTO transaction_history (user_id, typ, waluta_z, waluta_do, kwota_z, kwota_do, kurs) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
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
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
