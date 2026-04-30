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
    ],
    messages: [],
    authors: [],
    admins: [],
    reviewers: [],
    review_assignments: []
};

class FileDB {
    constructor() {
        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2));
        }
    }

    read() {
        const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        if (!data.messages) data.messages = [];
        return data;
    }

    write(data) {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    }

    async query(text, params) {
        const data = this.read();
        
        // Mocking SQL queries for the "Real System" experience
        if (text.includes('INSERT INTO authors')) {
            const [name, email, phone] = params;
            let author = data.authors.find(a => a.email === email);
            if (!author) {
                const maxId = data.authors.reduce((max, a) => Math.max(max, a.id), 0);
                author = { id: maxId + 1, name, email, phone, created_at: new Date() };
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

        if (text.includes('UPDATE authors SET phone = $1 WHERE id = $2')) {
            const [phone, id] = params;
            const author = data.authors.find(a => a.id == id);
            if (author) {
                author.phone = phone;
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

        if (text.includes('SELECT a.*, au.name as author_name, au.email as author_email, au.phone as author_phone, c.name as category_name') || 
            text.includes('SELECT a.*, au.name as author_name, c.name as category_name')) {
            const result = data.articles.map(a => {
                const author = data.authors.find(au => au.id === a.author_id);
                return {
                    ...a,
                    author_name: author?.name || 'Unknown',
                    author_email: author?.email || '',
                    author_phone: author?.phone || '',
                    category_name: data.categories.find(c => c.id === a.category_id)?.name || 'General'
                };
            }).reverse();
            
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

        if (text.includes('SELECT * FROM messages WHERE article_id = $1')) {
            const articleId = params[0];
            return { rows: data.messages.filter(m => m.article_id == articleId) };
        }

        if (text.includes('SELECT m.*, a.title as article_title')) {
            const result = (data.messages || []).map(m => ({
                ...m,
                article_title: data.articles.find(a => a.id == m.article_id)?.title || 'Unknown Article'
            }));
            
            // Handle author-specific notifications
            if (text.includes('JOIN authors au')) {
                const email = params[0];
                const author = data.authors.find(au => au.email === email);
                if (!author) return { rows: [] };
                
                const authorArticleIds = data.articles
                    .filter(a => a.author_id === author.id)
                    .map(a => a.id);
                
                const filtered = result.filter(m => 
                    authorArticleIds.includes(Number(m.article_id)) && 
                    m.sender_role === 'admin'
                );
                return { rows: filtered.reverse() };
            }
            
            return { rows: result.reverse() };
        }

        if (text.includes('INSERT INTO messages')) {
            const [article_id, sender_role, sender_name, sender_email, content, file_content, file_name, file_type] = params;
            const maxId = data.messages.reduce((max, m) => Math.max(max, m.id), 0);
            const message = {
                id: maxId + 1,
                article_id,
                sender_role,
                sender_name,
                sender_email,
                content,
                file_content,
                file_name,
                file_type,
                created_at: new Date()
            };
            data.messages.push(message);
            this.write(data);
            return { rows: [message] };
        }
        if (text.includes('DELETE FROM articles WHERE id = $1')) {
            const id = params[0];
            const index = data.articles.findIndex(a => a.id == id);
            if (index !== -1) {
                const deleted = data.articles.splice(index, 1);
                // Also delete related messages
                data.messages = data.messages.filter(m => m.article_id != id);
                this.write(data);
                return { rows: deleted };
            }
            return { rows: [] };
        }

        if (text.includes('DELETE FROM messages WHERE sender_role = $1')) {
            const role = params[0];
            data.messages = data.messages.filter(m => m.sender_role !== role);
            this.write(data);
            return { rowCount: 1 };
        }

        if (text.includes('DELETE FROM messages') && text.includes('JOIN authors au')) {
            const email = params[0];
            const author = data.authors.find(au => au.email === email);
            if (!author) return { rowCount: 0 };
            
            const authorArticleIds = data.articles
                .filter(a => a.author_id === author.id)
                .map(a => a.id);
            
            data.messages = data.messages.filter(m => 
                !(authorArticleIds.includes(Number(m.article_id)) && m.sender_role === 'admin')
            );
            this.write(data);
            return { rowCount: 1 };
        }

        if (text.includes('SELECT * FROM issues')) {
            return { rows: data.issues || [] };
        }

        if (text.includes('WHERE a.issue_id = $1')) {
            const issueId = params[0];
            const result = data.articles
                .filter(a => a.issue_id == issueId && a.status === 'Published')
                .map(a => ({
                    ...a,
                    author_name: data.authors.find(au => au.id === a.author_id)?.name || 'Unknown Author'
                }));
            return { rows: result };
        }

        if (text.includes('SELECT * FROM reviewers')) {
            return { rows: data.reviewers || [] };
        }

        if (text.includes('INSERT INTO review_assignments')) {
            const [article_id, reviewer_id] = params;
            const assignment = {
                id: (data.review_assignments || []).length + 1,
                article_id,
                reviewer_id,
                status: 'pending',
                assigned_at: new Date()
            };
            data.review_assignments = [...(data.review_assignments || []), assignment];
            this.write(data);
            return { rows: [assignment] };
        }

        if (text.includes('SELECT ra.*') && text.includes('JOIN reviewers r')) {
            const email = params[0];
            const reviewer = data.reviewers.find(r => r.email === email);
            if (!reviewer) return { rows: [] };
            
            const result = (data.review_assignments || [])
                .filter(ra => ra.reviewer_id === reviewer.id)
                .map(ra => ({
                    ...ra,
                    article_title: data.articles.find(a => a.id == ra.article_id)?.title || 'Unknown Article',
                    manuscript_content: data.articles.find(a => a.id == ra.article_id)?.manuscript_content,
                    manuscript_name: data.articles.find(a => a.id == ra.article_id)?.manuscript_name
                }));
            return { rows: result };
        }

        if (text.includes('UPDATE review_assignments')) {
            const [feedback, score, status, id] = params;
            const ra = data.review_assignments.find(r => r.id == id);
            if (ra) {
                ra.feedback = feedback;
                ra.score = score;
                ra.status = status;
                ra.completed_at = new Date();
                this.write(data);
                return { rows: [ra] };
            }
            return { rows: [] };
        }

        return { rows: [] };
    }
}

module.exports = new FileDB();
