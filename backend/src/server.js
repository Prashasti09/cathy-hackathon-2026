// Owner: Devesh (kurozadev05) - backend
// Starts the server.  Run with:  npm run dev
require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`StockSense API running on http://localhost:${PORT}`);
  try {
    await pool.query('SELECT 1');
    console.log('Connected to PostgreSQL');
  } catch (err) {
    console.error('Could NOT connect to PostgreSQL. Check DATABASE_URL in backend/.env ->', err.message);
  }
});
