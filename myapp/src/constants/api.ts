const deployedBaseUrl = "https://kantoronline.netlify.app/.netlify/functions";

export const API_BASE_URL = deployedBaseUrl;

export const API_ENDPOINTS = {
  AUTH_LOGIN: `${API_BASE_URL}/auth-login`,
  AUTH_REGISTER: `${API_BASE_URL}/auth-register`,
  RATES_CURRENT: `${API_BASE_URL}/rates-current`,
  EXCHANGE_EXECUTE: `${API_BASE_URL}/exchange-execute`,
  WALLET_BALANCES: `${API_BASE_URL}/wallet-balances`,
  HISTORY_GET: `${API_BASE_URL}/history-get`,
};
