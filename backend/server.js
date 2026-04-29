const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const fileDb = require('./file-db');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const PORT = process.env.PORT || 5000;

const { Client } = require('pg');
const fs = require('fs');

let activeDb = db; // Default to Postgres
let dbInitError = null;
let isUsingFileDb = false;

// Initialize Database (The "Real System" Setup)
const initRealDb = async () => {
    // If Postgres is not explicitly enabled and we aren't on Railway with a DB, default to File DB
    const hasRailwayDb = process.env.DATABASE_URL || process.env.PGHOST;
    if (process.env.USE_POSTGRES !== 'true' && !hasRailwayDb) {
        console.log("Using Persistent File-Based Database (Postgres disabled by default)...");
        activeDb = fileDb;
        isUsingFileDb = true;
        return;
    }

    const dbConfig = process.env.DATABASE_URL 
        ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
        : {
            user: process.env.PGUSER || process.env.DB_USER || 'postgres',
            host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
            password: process.env.PGPASSWORD || process.env.DB_PASSWORD || 'password',
            port: process.env.PGPORT || process.env.DB_PORT || 5432,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        };

    const targetDb = process.env.PGDATABASE || process.env.DB_NAME || 'rsquare_journal';

    try {
        console.log("--- REAL SYSTEM INITIALIZATION ---");
        
        let appClient;
        if (process.env.DATABASE_URL) {
            appClient = new Client(dbConfig);
            await appClient.connect();
        } else {
            // 1. Connect to default 'postgres' to check/create target DB
            const pgClient = new Client({ ...dbConfig, database: 'postgres', connectionTimeoutMillis: 2000 });
            await pgClient.connect();
            
            const dbCheck = await pgClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [targetDb]);
            if (dbCheck.rowCount === 0) {
                console.log(`Creating database: ${targetDb}`);
                await pgClient.query(`CREATE DATABASE ${targetDb}`);
            }
            await pgClient.end();

            // 2. Connect to the target DB to setup tables
            appClient = new Client({ ...dbConfig, database: targetDb, connectionTimeoutMillis: 2000 });
            await appClient.connect();
        }
        
        console.log("Setting up tables and seeding categories...");
        await appClient.query(`
            CREATE TABLE IF NOT EXISTS authors (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(100),
                affiliation TEXT,
                bio TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS articles (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                abstract TEXT,
                content TEXT,
                author_id INTEGER REFERENCES authors(id),
                category_id INTEGER REFERENCES categories(id),
                status VARCHAR(20) DEFAULT 'pending',
                file_name TEXT,
                published_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(100) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS issues (
                id SERIAL PRIMARY KEY,
                volume INTEGER,
                issue_number INTEGER,
                publication_month VARCHAR(20),
                publication_year INTEGER,
                is_current BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            INSERT INTO admins (username, password) VALUES ('admin', 'admin123') ON CONFLICT (username) DO NOTHING;
            
            INSERT INTO categories (name) VALUES 
            ('Clinical Research'), ('Case Reports'), ('Review Articles'), ('Editorial')
            ON CONFLICT (name) DO NOTHING;

            INSERT INTO issues (volume, issue_number, publication_month, publication_year, is_current) 
            VALUES (1, 1, 'April', 2026, TRUE) ON CONFLICT DO NOTHING;
        `);
        await appClient.end();
        console.log("REAL SYSTEM READY (PostgreSQL).");
        activeDb = db;
        isUsingFileDb = false;
        dbInitError = null;
    } catch (err) {
        console.error("POSTGRES CONNECTION FAILED:", err.code);
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
            console.warn("Switching to Persistent File-Based Database for 'Real System' experience...");
            activeDb = fileDb;
            isUsingFileDb = true;
            dbInitError = null;
        } else {
            dbInitError = JSON.stringify({
                message: err.message,
                code: err.code
            });
        }
    }
};

initRealDb();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve Static Frontend Files
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// API Routes would normally go here...
// (I will add the SPA fallback at the bottom)

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await activeDb.query('SELECT * FROM authors WHERE email = $1 AND password = $2', [email, password]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    const { email, newPassword, securityCode } = req.body;
    // For authors, security code is AUTH2026
    if (securityCode !== 'AUTH2026') {
        return res.status(403).json({ message: "Invalid security code" });
    }

    try {
        const result = await activeDb.query(
            'UPDATE authors SET password = $1 WHERE email = $2 RETURNING *',
            [newPassword, email]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Author account not found" });
        }
        res.json({ message: "Password reset successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await activeDb.query('SELECT * FROM admins WHERE username = $1 AND password = $2', [username, password]);
        if (result.rows.length > 0) {
            const admin = result.rows[0];
            res.json({ name: 'Super Admin', role: 'admin', email: 'admin@rsquare.com', username: admin.username });
        } else {
            res.status(401).json({ message: "Invalid admin credentials" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

app.post('/api/admin/reset-password', async (req, res) => {
    const { username, newPassword, securityCode } = req.body;
    // Mock security code for demo
    if (securityCode !== 'RSQ2026') {
        return res.status(403).json({ message: "Invalid security code" });
    }

    try {
        const result = await activeDb.query(
            'UPDATE admins SET password = $1 WHERE username = $2 RETURNING *',
            [newPassword, username]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Admin user not found" });
        }
        res.json({ message: "Password reset successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    let payload;
    
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        payload = ticket.getPayload();
    } catch (error) {
        console.error('TOKEN ERROR: Audience:', process.env.GOOGLE_CLIENT_ID);
        console.error('TOKEN ERROR: Message:', error.message);
        return res.status(401).json({ message: 'Invalid Google token' });
    }

    const { sub, email, name, picture } = payload;

    try {
        // Sync with authors table
        await activeDb.query(`
            INSERT INTO authors (name, email) 
            VALUES ($1, $2) 
            ON CONFLICT (email) DO UPDATE 
            SET name = EXCLUDED.name
        `, [name, email]);

        res.json({
            name,
            email,
            picture,
            googleId: sub
        });
    } catch (dbError) {
        console.error('CRITICAL: Database error during Google login:', dbError);
        // Fallback for demo: if DB fails, still log in but warn
        res.json({
            name,
            email,
            picture,
            googleId: sub,
            dbError: true
        });
    }
});

// Get all articles
app.get('/api/articles', async (req, res) => {
    try {
        const result = await activeDb.query(`
            SELECT a.*, au.name as author_name, c.name as category_name 
            FROM articles a
            JOIN authors au ON a.author_id = au.id
            JOIN categories c ON a.category_id = c.id
            ORDER BY a.published_date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("FETCH ERROR:", err.message);
        res.status(500).json({ message: "Database Error", detail: err.message });
    }
});

// Get user submissions
app.get('/api/my-submissions', async (req, res) => {
    try {
        const { email } = req.query;
        const result = await activeDb.query(`
            SELECT a.*, au.name as author_name, c.name as category_name 
            FROM articles a
            JOIN authors au ON a.author_id = au.id
            JOIN categories c ON a.category_id = c.id
            WHERE au.email = $1
            ORDER BY a.created_at DESC
        `, [email]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Get latest issue
app.get('/api/issues/current', async (req, res) => {
    try {
        const result = await activeDb.query('SELECT * FROM issues WHERE is_current = TRUE LIMIT 1');
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Get categories
app.get('/api/categories', async (req, res) => {
    try {
        const result = await activeDb.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Submit manuscript
app.post('/api/articles/submit', async (req, res) => {
    const { title, abstract, email, category_id, file_name, file_content, author_name } = req.body;
    
    try {
        if (dbInitError) {
            throw new Error(`Database Initialization Failed: ${dbInitError}`);
        }

        // Find author_id from email, or create if missing
        let authorRes = await activeDb.query('SELECT id FROM authors WHERE email = $1', [email]);
        let author_id;
        
        if (authorRes.rows.length === 0) {
            // Create author on the fly if missing (self-healing)
            const newAuthor = await activeDb.query(
                'INSERT INTO authors (name, email) VALUES ($1, $2) RETURNING id',
                [author_name || 'Unknown Author', email]
            );
            author_id = newAuthor.rows[0].id;
        } else {
            author_id = authorRes.rows[0].id;
        }

        const result = await activeDb.query(
            'INSERT INTO articles (title, abstract, author_id, category_id, status, content, file_name) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [title, abstract, author_id, category_id || 1, 'pending', file_content, file_name]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("SUBMISSION ERROR:", err.message);
        res.status(500).json({ 
            message: "Real Database Error: " + err.message,
            detail: err.detail,
            hint: err.hint,
            code: err.code
        });
    }
});

// Update article status (Admin Only)
app.put('/api/articles/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await activeDb.query(
            'UPDATE articles SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Article not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("STATUS UPDATE ERROR:", err.message);
        // Mock success for demo
        res.json({ id, status, message: "Status updated (Mock mode)" });
    }
});

// Delete article (Admin Only)
app.delete('/api/articles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await activeDb.query('DELETE FROM articles WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Article not found" });
        }
        res.json({ message: "Article deleted successfully", id });
    } catch (err) {
        console.error("DELETE ERROR:", err.message);
        res.status(500).json({ message: "Database Error", detail: err.message });
    }
});

// Get author profile
app.get('/api/authors/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const result = await activeDb.query('SELECT * FROM authors WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Author not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Update author profile
app.put('/api/authors/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const { name, affiliation, bio } = req.body;
        const result = await activeDb.query(
            'UPDATE authors SET name = $1, affiliation = $2, bio = $3 WHERE email = $4 RETURNING *',
            [name, affiliation, bio, email]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Author not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Admin: Get all authors with stats
app.get('/api/admin/authors', async (req, res) => {
    try {
        const result = await activeDb.query(`
            SELECT au.*, COUNT(ar.id) as manuscript_count
            FROM authors au
            LEFT JOIN articles ar ON au.id = ar.author_id
            GROUP BY au.id
            ORDER BY manuscript_count DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("ADMIN AUTHORS ERROR:", err.message);
        res.status(500).json({ message: "Database Error" });
    }
});

// Admin: Get dashboard analytics
app.get('/api/admin/stats/analytics', async (req, res) => {
    try {
        const articles = await activeDb.query('SELECT status, created_at FROM articles');
        const authors = await activeDb.query('SELECT created_at FROM authors');
        
        // Mocking some trend data based on actual dates
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const submissionTrend = months.map(m => ({ name: m, total: 0 }));
        
        articles.rows.forEach(a => {
            const date = new Date(a.created_at);
            submissionTrend[date.getMonth()].total++;
        });

        res.json({
            submissionTrend,
            statusDistribution: [
                { name: 'Pending', value: articles.rows.filter(a => a.status === 'pending').length },
                { name: 'Published', value: articles.rows.filter(a => a.status === 'published').length },
                { name: 'Rejected', value: articles.rows.filter(a => a.status === 'rejected').length },
            ],
            totalAuthors: authors.rows.length,
            totalManuscripts: articles.rows.length
        });
    } catch (err) {
        console.error("STATS ERROR:", err.message);
        res.status(500).json({ message: "Database Error" });
    }
});

// Admin: Send Notification
app.post('/api/admin/notifications/send', async (req, res) => {
    const { target, message, type } = req.body;
    // In a real app, this would send emails or push notifications
    console.log(`Sending ${type} notification to ${target}: ${message}`);
    res.json({ success: true, message: "Notification sent successfully (Mocked)" });
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await activeDb.query('SELECT 1');
        res.json({ 
            status: 'ok', 
            database: isUsingFileDb ? 'FileDB (Persistent)' : 'PostgreSQL', 
            connected: true 
        });
    } catch (err) {
        res.status(500).json({ status: 'error', database: 'disconnected', message: err.message });
    }
});

// SPA Fallback: Serve index.html for any unknown non-API routes
app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`\n🚀 Application is ready! Click here to open: http://localhost:${PORT}\n`);
});
