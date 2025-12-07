import { Client, QueryResult, QueryResultRow } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

export async function query<T extends QueryResultRow>(
  text: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  if (!connectionString) {
    throw new Error("Brak DATABASE_URL w zmiennych środowiskowych.");
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
    const result: QueryResult<T> = await client.query(text, params);
    return result;
  } catch (error) {
    console.error("Błąd zapytania do bazy danych:", error);
    throw error;
  } finally {
    await client.end();
  }
}
