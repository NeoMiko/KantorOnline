import { HandlerResponse, HandlerEvent } from "@netlify/functions";
import bcrypt from "bcryptjs";
import { query } from "./utils/db";

export const handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { username, password } = JSON.parse(event.body || "{}");

    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Podaj login i hasło." }),
      };
    }

    // Sprawdź czy użytkownik istnieje
    const userExists = await query("SELECT id FROM users WHERE username = $1", [
      username,
    ]);
    if (userExists.rows.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Użytkownik już istnieje." }),
      };
    }

    // Haszowanie hasła
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //  Zapis do bazy
    const newUser = await query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id",
      [username, hashedPassword]
    );

    // Dodaj  10 000 PLN na start
    await query(
      "INSERT INTO temp_balances (waluta_skrot, saldo) VALUES ($1, $2)",
      ["PLN", 10000]
    );

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Konto utworzone pomyślnie!" }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
