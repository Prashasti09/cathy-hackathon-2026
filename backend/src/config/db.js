// Owner: Devesh (kurozadev05) - backend
// Connection to PostgreSQL. Every other backend file does:
//   const pool = require('../config/db');
//   const result = await pool.query('SELECT * FROM products');
require('dotenv').config();
const { Pool, types } = require('pg');

// Return DATE columns as plain 'YYYY-MM-DD' strings (avoids timezone bugs)
types.setTypeParser(1082, (v) => v);
// Return NUMERIC columns as JS numbers instead of strings
types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v)));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.on('error', (err) => console.error('PostgreSQL error:', err.message));

module.exports = pool;
