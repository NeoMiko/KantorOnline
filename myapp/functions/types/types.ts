import {
  HandlerResponse,
  HandlerEvent,
  HandlerContext,
} from "@netlify/functions";

export { HandlerResponse, HandlerEvent, HandlerContext };
export interface Balance {
  waluta_skrot: string;
  saldo: number;
}
export interface Transaction {
  id: number;
  typ: string;
  waluta_z: string;
  waluta_do: string;
  kwota_z: number;
  kwota_do: number;
  kurs: number;
  data: string;
}

export type Handler = (
  event: HandlerEvent,
  context: HandlerContext
) => Promise<HandlerResponse>;
