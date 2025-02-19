import { Client } from "pg";

async function query(objectSelect) {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
  });
  try {
    await client.connect();
    const result = await client.query(objectSelect);
    return result;
  } catch (error) {
    console.log(error);
  } finally {
    await client.end();
  }
}

export default {
  query: query,
};
