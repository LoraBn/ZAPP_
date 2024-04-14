require('dotenv').config();

const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?ssl=true`;

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: connectionString,
});

module.exports = pool;
