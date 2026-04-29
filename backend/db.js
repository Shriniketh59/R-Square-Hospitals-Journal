const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'rsquare_journal',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
    connectionTimeoutMillis: 5000, // 5 seconds timeout
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

module.exports = {
    query: (text, params) => {
        console.log('Executing query:', text);
        return pool.query(text, params);
    },
};
