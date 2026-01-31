import { Handler, HandlerResponse } from "../types/types";

export const authenticatedHandler =
  (fn: Handler): Handler =>
  async (event, context) => {
    console.log("=== AUTH MIDDLEWARE ===");
    console.log("Headers:", event.headers);
    
    const authHeader = event.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Brak tokena Bearer");
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: "Brak autoryzacji. Zaloguj się.",
        }),
        headers: { "Content-Type": "application/json" },
      };
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token);

    if (!token || token === "undefined" || token === "null") {
      console.error("Token nieprawidłowy");
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Nieprawidłowy token." }),
        headers: { "Content-Type": "application/json" },
      };
    }

    // Akceptujemy każdy token (dummy-token-123 etc.)
    console.log("Token OK, przekazuję do handlera");
    return fn(event, context);
  };
