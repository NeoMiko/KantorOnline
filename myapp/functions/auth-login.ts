import { HandlerResponse, HandlerEvent } from "@netlify/functions";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "./utils/db";

export const handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  try {
    const { username, password } = JSON.parse(event.body || "{}");

    const res = await query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (res.rows.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "Nieprawidłowy login lub hasło." }),
      };
    }

    const user = res.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "Nieprawidłowy login lub hasło." }),
      };
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token,
        username: user.username,
        userId: user.id,
      }),
    };
  } catch (error: any) {
    console.error("Błąd w auth-login:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Błąd serwera: " + error.message }),
    };
  }
};
