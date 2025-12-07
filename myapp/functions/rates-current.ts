import { Handler, RatesApiResponse, Rate } from "./types/types";
import { query } from "./utils/db";

interface RateRow {
  currency_code: string;
  buy_rate: number;
  sell_rate: number;
}

const ratesCurrentLogic = async (): Promise<RatesApiResponse> => {
  const ratesData: RateRow[] = [
    { currency_code: "USD", buy_rate: 4.0512, sell_rate: 4.1567 },
    { currency_code: "EUR", buy_rate: 4.4988, sell_rate: 4.5932 },
    { currency_code: "CHF", buy_rate: 4.6, sell_rate: 4.6811 },
  ];

  const rates: Rate[] = ratesData.map((row) => ({
    waluta_skrot: row.currency_code,
    kurs_kupna: row.buy_rate,
    kurs_sprzedazy: row.sell_rate,
  }));

  return {
    date: new Date().toISOString(),
    rates: rates,
  };
};

export const handler: Handler = async (event, context) => {
  try {
    const responseData = await ratesCurrentLogic();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(responseData),
    };
  } catch (error) {
    console.error("Błąd pobierania kursów:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Błąd serwera podczas pobierania kursów.",
      }),
    };
  }
};
