import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 5000,
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Wykonano zapytanie:", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error("BŁĄD BAZY DANYCH:", error);
    throw error;
  }
};
