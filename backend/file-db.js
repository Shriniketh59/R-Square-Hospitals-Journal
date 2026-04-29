const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const DB_FILE = path.join(DATA_DIR, 'journal_db.json');

const defaultDb = {
    authors: [],
    admins: [
        { id: 1, username: 'admin', password: 'admin123' }
    ],
    categories: [
        { id: 1, name: 'Clinical Research' },
        { id: 2, name: 'Case Reports' },
        { id: 3, name: 'Review Articles' },
        { id: 4, name: 'Editorial' }
    ],
    articles: [],
    issues: [
        { id: 1, volume: 1, issue_number: 1, publication_month: 'April', publication_year: 2026, is_current: true }
    ]
};

class FileDB {
    constructor() {
        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2));
        }
    }

    read() {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }

    write(data) {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    }

    async query(text, params) {
        const data = this.read();
        
        // Mocking SQL queries for the "Real System" experience
        if (text.includes('INSERT INTO authors')) {
            const [name, email] = params;
            let author = data.authors.find(a => a.email === email);
            if (!author) {
                const maxId = data.authors.reduce((max, a) => Math.max(max, a.id), 0);
                author = { id: maxId + 1, name, email, created_at: new Date() };
                data.authors.push(author);
                this.write(data);
            }
            return { rows: [author] };
        }

        if (text.includes('SELECT 1 FROM pg_database')) return { rowCount: 1 };
        
        if (text.includes('SELECT * FROM issues')) {
            const issue = data.issues?.find(i => i.is_current) || data.issues?.[0];
            return { rows: issue ? [issue] : [] };
        }
        
        if (text.includes('SELECT * FROM categories')) {
            return { rows: data.categories };
        }

        if (text.includes('SELECT id FROM authors WHERE email = $1')) {
            const author = data.authors.find(a => a.email === params[0]);
            return { rows: author ? [author] : [] };
        }

        if (text.includes('SELECT * FROM admins WHERE username = $1 AND password = $2')) {
            const admin = data.admins.find(a => a.username === params[0] && a.password === params[1]);
            return { rows: admin ? [admin] : [] };
        }

        if (text.includes('UPDATE admins SET password = $1 WHERE username = $2')) {
            const [newPassword, username] = params;
            const admin = data.admins.find(a => a.username === username);
            if (admin) {
                admin.password = newPassword;
                this.write(data);
                return { rows: [admin] };
            }
            return { rows: [] };
        }

        if (text.includes('SELECT * FROM authors WHERE email = $1 AND password = $2')) {
            const author = data.authors.find(a => a.email === params[0] && a.password === params[1]);
            return { rows: author ? [author] : [] };
        }

        if (text.includes('UPDATE authors SET password = $1 WHERE email = $2')) {
            const [newPassword, email] = params;
            const author = data.authors.find(a => a.email === email);
            if (author) {
                author.password = newPassword;
                this.write(data);
                return { rows: [author] };
            }
            return { rows: [] };
        }

        if (text.includes('INSERT INTO articles')) {
            const [title, abstract, author_id, category_id, status, content, file_name] = params;
            const maxId = data.articles.reduce((max, a) => Math.max(max, a.id), 0);
            const article = {
                id: maxId + 1,
                title,
                abstract,
                author_id,
                category_id,
                status,
                content,
                file_name,
                created_at: new Date(),
                published_date: new Date()
            };
            data.articles.push(article);
            this.write(data);
            return { rows: [article] };
        }

        if (text.includes('SELECT a.*, au.name as author_name, c.name as category_name')) {
            const result = data.articles.map(a => ({
                ...a,
                author_name: data.authors.find(au => au.id === a.author_id)?.name || 'Unknown',
                category_name: data.categories.find(c => c.id === a.category_id)?.name || 'General'
            })).reverse();
            
            if (text.includes('WHERE au.email = $1')) {
                const author = data.authors.find(au => au.email === params[0]);
                return { rows: result.filter(a => a.author_id === author?.id) };
            }
            return { rows: result };
        }

        if (text.includes('UPDATE articles SET status = $1')) {
            const [status, id] = params;
            const article = data.articles.find(a => a.id == id);
            if (article) {
                article.status = status;
                this.write(data);
                return { rows: [article] };
            }
            return { rows: [] };
        }

        if (text.includes('DELETE FROM articles')) {
            const [id] = params;
            const index = data.articles.findIndex(a => a.id == id);
            if (index !== -1) {
                const deleted = data.articles.splice(index, 1);
                this.write(data);
                return { rows: deleted };
            }
            return { rows: [] };
        }

        return { rows: [] };
    }
}

module.exports = new FileDB();
