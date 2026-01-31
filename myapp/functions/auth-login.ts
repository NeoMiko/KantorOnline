import { HandlerResponse, HandlerEvent } from "@netlify/functions";
import { query } from "./utils/db";

export const handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  try {
    console.log("=== AUTH-LOGIN START ===");
    console.log("Method:", event.httpMethod);
    console.log("Body:", event.body);

    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Użyj POST" }),
      };
    }

    const { username, password } = JSON.parse(event.body || "{}");

    if (!username || !password) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Podaj username i password" }),
      };
    }

    console.log("Szukam użytkownika:", username);

    const res = await query(
      "SELECT id, username, password FROM users WHERE username = $1",
      [username]
    );

    if (res.rows.length === 0) {
      console.log("Użytkownik nie istnieje");
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Użytkownik nie istnieje. Zarejestruj się." }),
      };
    }

    const user = res.rows[0];

    if (user.password !== password) {
      console.log("Złe hasło");
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Złe hasło." }),
      };
    }

    console.log("Zalogowano pomyślnie:", user.id);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: String(user.id),
        username: user.username,
        token: "dummy-token-" + user.id,
      }),
    };
  } catch (error: any) {
    console.error("BŁĄD AUTH-LOGIN:", error.message);
    console.error("Stack:", error.stack);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Błąd serwera",
        error: error.message,
      }),
    };
  }
};
