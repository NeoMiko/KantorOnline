import Constants from "expo-constants";

const isLocal = __DEV__;

const localIP = "localhost";
const localBaseUrl = `http://${localIP}:8888/.netlify/functions`;

// ZMIEŃ NA SWÓJ URL NETLIFY PO WDROŻENIU!
const deployedBaseUrl =
  "https://twoja-aplikacja-kantor.netlify.app/.netlify/functions";

export const API_BASE_URL = isLocal ? localBaseUrl : deployedBaseUrl;

export const API_ENDPOINTS = {
  RATES_CURRENT: `${API_BASE_URL}/rates-current`,
  EXCHANGE_EXECUTE: `${API_BASE_URL}/exchange-execute`,
  WALLET_BALANCES: `${API_BASE_URL}/wallet-balances`,
};
