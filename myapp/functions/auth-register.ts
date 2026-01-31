import { HandlerResponse, HandlerEvent } from "@netlify/functions";
import { query } from "./utils/db";

export const handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  try {
    console.log("=== AUTH-REGISTER START ===");
    console.log("Method:", event.httpMethod);
    console.log("Body:", event.body);

    const { username, password } = JSON.parse(event.body || "{}");

    if (!username || !password) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Podaj username i password" }),
      };
    }

    console.log("Sprawdzam czy user istnieje:", username);

    const userExists = await query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    if (userExists.rows.length > 0) {
      console.log("User już istnieje");
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Użytkownik już istnieje. Zaloguj się." }),
      };
    }

    console.log("Tworzę nowego użytkownika");

    await query("BEGIN");

    const newUser = await query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
      [username, password]
    );

    const userId = newUser.rows[0].id;
    console.log("Utworzono użytkownika:", userId);

    const currencies = ["PLN", "USD", "EUR", "CHF", "GBP"];
    for (const code of currencies) {
      await query(
        "INSERT INTO temp_balances (user_id, waluta_skrot, saldo) VALUES ($1, $2, $3)",
        [userId, code, code === "PLN" ? 10000 : 0]
      );
    }

    await query("COMMIT");
    console.log("Portfel utworzony");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Konto utworzone!",
        userId: String(userId),
        username,
        token: "dummy-token-" + userId,
      }),
    };
  } catch (error: any) {
    await query("ROLLBACK").catch(() => {});
    console.error("BŁĄD AUTH-REGISTER:", error.message);
    console.error("Stack:", error.stack);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Błąd serwera: " + error.message }),
    };
  }
};
