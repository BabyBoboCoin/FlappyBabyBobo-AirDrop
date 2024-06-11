import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false // Setzen Sie dies auf { rejectUnauthorized: false }, wenn SSL verwendet wird
});

export default pool;
