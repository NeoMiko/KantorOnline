import { Pool } from "pg";

export const query = async (text: string, params?: any[]) => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    const res = await pool.query(text, params);
    return res;
  } finally {
    await pool.end();
  }
};
