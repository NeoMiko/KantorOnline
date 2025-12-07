import {
  HandlerResponse,
  HandlerEvent,
  HandlerContext,
} from "@netlify/functions";

export interface Rate {
  waluta_skrot: string;
  kurs_kupna: number;
  kurs_sprzedazy: number;
}

export interface RatesApiResponse {
  date: string;
  rates: Rate[];
}

export type Handler = (
  event: HandlerEvent,
  context: HandlerContext
) => Promise<HandlerResponse>;
