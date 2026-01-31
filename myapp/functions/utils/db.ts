import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },

  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    console.log(`[DB] Query executed in ${duration}ms. Rows: ${res.rowCount}`);
    return res;
  } catch (error: any) {
    console.error("BŁĄD BAZY DANYCH:", error.message);
    throw error;
  }
};
