const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: false // SSL-Verbindungen deaktivieren
});

async function testConnection() {
  try {
    await client.connect();
    console.log("Connected to the database");

    const res = await client.query('SELECT NOW()');
    console.log("Test query result:", res.rows[0]);

    await client.end();
    console.log("Connection closed");
  } catch (err) {
    console.error('Database connection error:', err.stack);
  }
}

testConnection();
