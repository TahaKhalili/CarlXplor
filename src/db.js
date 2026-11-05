const { Pool } = require('pg');

const pool = new Pool({
  user: 'carlsexplore',
  host: 'localhost',
  database: 'carlsexplore',
  password: 'blackFish9845',
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to PostgreSQL/PostGIS database');
  release();
});

module.exports = pool;