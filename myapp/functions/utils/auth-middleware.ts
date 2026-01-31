import { Handler, HandlerResponse } from "../types/types";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

export const authenticatedHandler =
  (fn: Handler): Handler =>
  async (event, context) => {
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 204, headers: CORS_HEADERS, body: "" };
    }

    const authHeader = event.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Brak autoryzacji." }),
      };
    }

    const token = authHeader.split(" ")[1];
    if (!token || token === "undefined" || token === "null") {
      return {
        statusCode: 401,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Nieprawidłowy token." }),
      };
    }

    return fn(event, context);
  };
