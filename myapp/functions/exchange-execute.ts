import { HandlerResponse, HandlerEvent } from "@netlify/functions";
import { query } from "./utils/db";

export const handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { fromCurrency, toCurrency, amount, rate, userId } = JSON.parse(
      event.body || "{}"
    );

    if (!userId) throw new Error("Brak identyfikatora użytkownika.");

    const amountToReceive =
      fromCurrency === "PLN" ? amount / rate : amount * rate;

    // Sprawdzenie salda
    const checkRes = await query(
      "SELECT saldo FROM temp_balances WHERE waluta_skrot = $1 AND user_id = $2",
      [fromCurrency, userId]
    );

    if (checkRes.rows.length === 0 || checkRes.rows[0].saldo < amount) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "Niewystarczające środki." }),
      };
    }

    // Transakcja wymiany
    await query(
      "UPDATE temp_balances SET saldo = saldo - $1 WHERE waluta_skrot = $2 AND user_id = $3",
      [amount, fromCurrency, userId]
    );
    await query(
      "UPDATE temp_balances SET saldo = saldo + $1 WHERE waluta_skrot = $2 AND user_id = $3",
      [amountToReceive, toCurrency, userId]
    );

    // Historia
    await query(
      "INSERT INTO transaction_history (user_id, typ, waluta_z, waluta_do, kwota_z, kwota_do, kurs) VALUES ($1, $2, $3, $4, $5, $6, $7)",
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
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Wymiana udana!" }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: error.message }),
    };
  }
};
