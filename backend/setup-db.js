const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

async function setup() {
    const client = new Client({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: 'postgres', // Connect to default db first
        password: process.env.DB_PASSWORD || 'password',
        port: process.env.DB_PORT || 5432,
    });

    try {
        await client.connect();
        
        // Create database if not exists
        const dbName = process.env.DB_NAME || 'rsquare_journal';
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
        
        if (res.rowCount === 0) {
            console.log(`Creating database ${dbName}...`);
            await client.query(`CREATE DATABASE ${dbName}`);
        } else {
            console.log(`Database ${dbName} already exists.`);
        }
        await client.end();

        // Connect to the new database and run schema
        const appClient = new Client({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: dbName,
            password: process.env.DB_PASSWORD || 'password',
            port: process.env.DB_PORT || 5432,
        });

        await appClient.connect();
        console.log('Running schema.sql...');
        await appClient.query(schema);
        console.log('Database setup complete.');
        await appClient.end();

    } catch (err) {
        console.error('Error during setup:', err);
    }
}

setup();
