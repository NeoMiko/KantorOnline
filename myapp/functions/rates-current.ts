import { HandlerResponse, HandlerEvent } from "@netlify/functions";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export const handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: "",
    };
  }

  try {
    const nbpResponse = await fetch(
      "https://api.nbp.pl/api/exchangerates/tables/a/?format=json"
    );

    if (!nbpResponse.ok) throw new Error("Błąd odpowiedzi NBP");

    const nbpData = await nbpResponse.json();

    const nbpRates = nbpData[0].rates;
    const date = nbpData[0].effectiveDate;

    const interestCurrencies = ["USD", "EUR", "CHF", "GBP"];
    const spread = 0.05;

    const rates = nbpRates
      .filter((r: any) => interestCurrencies.includes(r.code))
      .map((r: any) => ({
        waluta_skrot: r.code,
        kurs_kupna: r.mid - spread,
        kurs_sprzedazy: r.mid + spread,
      }));

    return {
      statusCode: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date, rates }),
    };
  } catch (error: any) {
    console.error("Błąd NBP:", error.message);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Nie udało się pobrać kursów z NBP." }),
    };
  }
};
