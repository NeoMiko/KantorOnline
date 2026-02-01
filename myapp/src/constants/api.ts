import Constants from "expo-constants";

const isLocal = __DEV__;

const localIP = "localhost";
const localBaseUrl = `http://${localIP}:8888/.netlify/functions`;

const deployedBaseUrl = "https://kantoronline.netlify.app/.netlify/functions";

export const API_BASE_URL = isLocal ? localBaseUrl : deployedBaseUrl;

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login`,
  REGISTER: `${API_BASE_URL}/register`,
  RATES_CURRENT: `${API_BASE_URL}/rates-current`,
  EXCHANGE_EXECUTE: `${API_BASE_URL}/exchange-execute`,
  WALLET_BALANCES: `${API_BASE_URL}/wallet-balances`,
  HISTORY_GET: `${API_BASE_URL}/history-get`,
};
