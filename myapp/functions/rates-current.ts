import { HandlerResponse } from "@netlify/functions";
import { query } from "./utils/db";
import { Transaction } from "./types/types";

export const handler = async (): Promise<HandlerResponse> => {
  try {
    const nbpResponse = await fetch(
      "https://api.nbp.pl/api/exchangerates/tables/a/?format=json"
    );
    const nbpData = await nbpResponse.json();

    const nbpRates = nbpData[0].rates;
    const date = nbpData[0].effectiveDate;

    const interestCurrencies = ["USD", "EUR", "CHF", "GBP"];
    const spread = 0.05;

    const rates: Transaction[] = nbpRates
      .filter((r: any) => interestCurrencies.includes(r.code))
      .map((r: any) => ({
        waluta_skrot: r.code,
        kurs_kupna: r.mid - spread,
        kurs_sprzedazy: r.mid + spread,
      }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, rates }),
    };
  } catch (error) {
    console.error("Błąd NBP:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Nie udało się pobrać kursów z NBP." }),
    };
  }
};
