const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config({ path: '../.env' }); 

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});

app.use(cors());
app.use(express.json());

app.get('/api/players', async (req, res) => {
  const { search } = req.query;
  try {
    const result = await pool.query(
      "SELECT * FROM club_players WHERE name ILIKE $1 LIMIT 10", 
      [`%${search}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});