const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const fileDb = require('./file-db');
const { OAuth2Client } = require('google-auth-library');
const twilio = require('twilio');
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

            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
                sender_role VARCHAR(20),
                sender_name VARCHAR(255),
                sender_email VARCHAR(100),
                content TEXT,
                file_content TEXT,
                file_name VARCHAR(255),
                file_type VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='sender_email') THEN
                    ALTER TABLE messages ADD COLUMN sender_email VARCHAR(100);
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='authors' AND column_name='phone') THEN
                    ALTER TABLE authors ADD COLUMN phone VARCHAR(20);
                END IF;
            END $$;

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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

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

// In-memory store for OTPs (for production, use Redis or a DB table)
const otpStore = new Map();

app.post('/api/auth/send-otp', async (req, res) => {
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
    }
    
    // Generate a random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore.set(phone, otp);
    
    // Set expiry for OTP (5 minutes)
    setTimeout(() => otpStore.delete(phone), 5 * 60 * 1000);
    
    try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        
        // In a real scenario, we would send the actual OTP
        // For the demo/free trial to work without pre-verifying every number:
        // We log it AND attempt to send if credentials exist.
        console.log(`[SMS] Sending OTP ${otp} to ${phone}`);
        
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            await client.messages.create({
                body: `Your R Square Hospitals Journal OTP is: ${otp}. It expires in 5 minutes.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone
            });
        }
        
        res.json({ message: "OTP sent successfully" });
    } catch (err) {
        console.error("SMS Sending Error:", err.message);
        // We still return success for demo purposes even if Twilio fails (e.g. unverified trial number)
        // so the user can still test with '1234'
        res.json({ 
            message: "OTP generated (Simulation Mode)", 
            debug: "If you have Twilio credentials, check your .env file. Error: " + err.message 
        });
    }
});

app.post('/api/auth/verify-otp', async (req, res) => {
    const { phone, otp } = req.body;
    
    const storedOtp = otpStore.get(phone);
    
    // Allow '1234' for local testing if needed, or strictly enforce storedOtp
    if (otp !== storedOtp && otp !== '1234') {
        return res.status(401).json({ message: "Invalid OTP" });
    }
    
    // Clear OTP after successful use
    otpStore.delete(phone);
    try {
        const syntheticEmail = `${phone}@phone.auth`;
        const result = await activeDb.query('SELECT * FROM authors WHERE email = $1', [syntheticEmail]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            // Ensure phone is stored if missing
            if (!user.phone) {
                await activeDb.query('UPDATE authors SET phone = $1 WHERE id = $2', [phone, user.id]);
                user.phone = phone;
            }
            res.json(user);
        } else {
            // Create user if not exists
            const newAuthor = await activeDb.query(
                'INSERT INTO authors (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
                ['Phone User', syntheticEmail, phone]
            );
            res.json(newAuthor.rows[0]);
        }
    } catch (err) {
        console.error("OTP Verify Error:", err);
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
// Chat Messages managed via updated routes at the bottom of file

app.get('/api/articles', async (req, res) => {
    try {
        const result = await activeDb.query(`
            SELECT a.*, au.name as author_name, au.email as author_email, au.phone as author_phone, c.name as category_name 
            FROM articles a
            JOIN authors au ON a.author_id = au.id
            JOIN categories c ON a.category_id = c.id
            ORDER BY a.created_at DESC
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

app.put('/api/articles/:id/revision', async (req, res) => {
    const { id } = req.params;
    const { manuscriptContent, manuscriptName, manuscriptType } = req.body;
    
    try {
        const result = await activeDb.query(
            'UPDATE articles SET manuscript_content = $1, manuscript_name = $2, manuscript_type = $3, status = $4 WHERE id = $5 RETURNING *',
            [manuscriptContent, manuscriptName, manuscriptType, 'Pending', id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Article not found" });
        }
        
        // Add a system message to the chat
        await activeDb.query(
            'INSERT INTO messages (article_id, sender_role, sender_name, content) VALUES ($1, $2, $3, $4)',
            [id, 'author', 'System', 'Author uploaded a revised version of the manuscript.']
        );

        res.json({ message: "Revision uploaded successfully", article: result.rows[0] });
    } catch (err) {
        console.error("REVISION ERROR:", err.message);
        res.status(500).json({ message: "Database Error" });
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

app.get('/api/messages/:articleId', async (req, res) => {
    const { articleId } = req.params;
    try {
        const result = await activeDb.query(
            'SELECT * FROM messages WHERE article_id = $1 ORDER BY created_at ASC',
            [articleId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("FETCH MESSAGES ERROR:", err.message);
        res.status(500).json({ message: "Database Error" });
    }
});

// Admin: Get all recent messages across all articles
app.get('/api/admin/all-messages', async (req, res) => {
    try {
        const result = await activeDb.query(`
            SELECT m.*, a.title as article_title 
            FROM messages m
            JOIN articles a ON m.article_id = a.id
            ORDER BY m.created_at DESC
            LIMIT 50
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("FETCH ALL MESSAGES ERROR:", err.message);
        res.status(500).json({ message: "Database Error" });
    }
});

app.delete('/api/messages/all', async (req, res) => {
    try {
        await activeDb.query('DELETE FROM messages WHERE sender_role = $1', ['author']);
        res.json({ message: "Admin notifications cleared" });
    } catch (err) {
        console.error("CLEAR ADMIN MESSAGES ERROR:", err.message);
        res.status(500).json({ message: "Database Error" });
    }
});

app.get('/api/author/notifications', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email required" });

    try {
        const result = await activeDb.query(`
            SELECT m.*, a.title as article_title 
            FROM messages m
            JOIN articles a ON m.article_id = a.id
            JOIN authors au ON a.author_id = au.id
            WHERE au.email = $1 AND m.sender_role = 'admin'
            ORDER BY m.created_at DESC
            LIMIT 20
        `, [email]);
        res.json(result.rows);
    } catch (err) {
        console.error("AUTHOR NOTIFICATIONS ERROR:", err.message);
        res.status(500).json({ message: "Database Error" });
    }
});

app.delete('/api/author/notifications/clear', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email required" });

    try {
        await activeDb.query(`
            DELETE FROM messages 
            WHERE sender_role = 'admin' AND article_id IN (
                SELECT a.id FROM articles a JOIN authors au ON a.author_id = au.id WHERE au.email = $1
            )
        `, [email]);
        res.json({ message: "Author notifications cleared" });
    } catch (err) {
        console.error("CLEAR AUTHOR MESSAGES ERROR:", err.message);
        res.status(500).json({ message: "Database Error" });
    }
});

app.post('/api/messages', async (req, res) => {
    const { articleId, senderRole, senderName, senderEmail, content, fileContent, fileName, fileType } = req.body;
    console.log(`[CHAT] Message received for article ${articleId} from ${senderName} (${senderEmail || senderRole})`);
    try {
        const result = await activeDb.query(
            'INSERT INTO messages (article_id, sender_role, sender_name, sender_email, content, file_content, file_name, file_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [articleId, senderRole, senderName, senderEmail, content, fileContent, fileName, fileType]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("SEND MESSAGE ERROR:", err.message);
        res.status(500).json({ message: "Database Error" });
    }
});

// Fetch all reviewers
app.get('/api/reviewers', async (req, res) => {
    try {
        const result = await activeDb.query('SELECT * FROM reviewers ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error("FETCH REVIEWERS ERROR:", err.message);
        res.status(500).json({ message: "Database Error" });
    }
});

// Assign reviewer to article
app.post('/api/review-assignments', async (req, res) => {
    const { articleId, reviewerId } = req.body;
    try {
        const result = await activeDb.query(
            'INSERT INTO review_assignments (article_id, reviewer_id) VALUES ($1, $2) RETURNING *',
            [articleId, reviewerId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("ASSIGN REVIEWER ERROR:", err.message);
        res.status(500).json({ message: "Database Error" });
    }
});

// Fetch assignments for a specific reviewer
app.get('/api/reviewer/assignments', async (req, res) => {
    const { email } = req.query;
    try {
        const result = await activeDb.query(`
            SELECT ra.*, a.title as article_title, a.manuscript_content, a.manuscript_name 
            FROM review_assignments ra
            JOIN articles a ON ra.article_id = a.id
            JOIN reviewers r ON ra.reviewer_id = r.id
            WHERE r.email = $1
        `, [email]);
        res.json(result.rows);
    } catch (err) {
        console.error("FETCH REVIEWER ASSIGNMENTS ERROR:", err.message);
        res.status(500).json({ message: "Database Error" });
    }
});

// Submit feedback
app.put('/api/review-assignments/:id', async (req, res) => {
    const { id } = req.params;
    const { feedback, score } = req.body;
    try {
        const result = await activeDb.query(
            'UPDATE review_assignments SET feedback = $1, score = $2, status = $3, completed_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
            [feedback, score, 'completed', id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("SUBMIT FEEDBACK ERROR:", err.message);
        res.status(500).json({ message: "Database Error" });
    }
});

// Fetch all issues
app.get('/api/issues', async (req, res) => {
    try {
        const result = await activeDb.query('SELECT * FROM issues ORDER BY publication_year DESC, volume DESC, issue_number DESC');
        res.json(result.rows);
    } catch (err) {
        console.error("FETCH ISSUES ERROR:", err.message);
        res.status(500).json({ message: "Database Error" });
    }
});

// Fetch articles in an issue
app.get('/api/issues/:id/articles', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await activeDb.query(`
            SELECT a.*, au.name as author_name 
            FROM articles a
            JOIN authors au ON a.author_id = au.id
            WHERE a.issue_id = $1 AND a.status = 'Published'
        `, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error("FETCH ISSUE ARTICLES ERROR:", err.message);
        res.status(500).json({ message: "Database Error" });
    }
});

app.listen(PORT, () => {
    console.log(`\n===================================================`);
    console.log(`  R SQUARE HOSPITALS JOURNAL - BACKEND ACTIVE`);
    console.log(`  VERSION: 2.0.1 (MULTIMEDIA CHAT ENABLED)`);
    console.log(`===================================================`);
    console.log(`\n🚀 SERVER RUNNING ON PORT: ${PORT}`);
    console.log(`🔗 OPEN APPLICATION: http://localhost:${PORT}`);
    console.log(`\n---------------------------------------------------\n`);
});
