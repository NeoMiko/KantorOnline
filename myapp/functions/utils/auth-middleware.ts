import { Handler, HandlerResponse } from "../types/types";

export const authenticatedHandler =
  (fn: Handler): Handler =>
  async (event, context) => {
    const authHeader = event.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Błąd autoryzacji: Brak tokena.");
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: "Brak autoryzacji. Musisz być zalogowany.",
        }),
        headers: { "Content-Type": "application/json" },
      };
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "undefined" || token === "null") {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Nieprawidłowy token autoryzacji." }),
        headers: { "Content-Type": "application/json" },
      };
    }

    return fn(event, context);
  };
