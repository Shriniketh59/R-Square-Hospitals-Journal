-- Database Schema for R Square Hospitals Journal

-- Authors Table
CREATE TABLE IF NOT EXISTS authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(100),
    affiliation TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Articles Table
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    abstract TEXT,
    content TEXT,
    author_id INTEGER REFERENCES authors(id),
    category_id INTEGER REFERENCES categories(id),
    doi VARCHAR(100) UNIQUE,
    published_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending', -- published, pending, rejected
    file_name TEXT,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);

-- Journals/Issues Table
CREATE TABLE IF NOT EXISTS issues (
    id SERIAL PRIMARY KEY,
    volume INTEGER,
    issue_number INTEGER,
    publication_month VARCHAR(20),
    publication_year INTEGER,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Article-Issue mapping
ALTER TABLE articles ADD COLUMN IF NOT EXISTS issue_id INTEGER REFERENCES issues(id);

-- Initial Data
INSERT INTO categories (name) VALUES 
('Clinical Research'), ('Case Reports'), ('Review Articles'), ('Editorial')
ON CONFLICT (name) DO NOTHING;

INSERT INTO authors (name, email, affiliation) VALUES 
('Dr. R. Square', 'admin@rsquare.com', 'R Square Hospitals Cardiology Dept')
ON CONFLICT (email) DO NOTHING;

INSERT INTO admins (username, password) VALUES ('admin', 'admin123') ON CONFLICT (username) DO NOTHING;

INSERT INTO issues (volume, issue_number, publication_month, publication_year, is_current) VALUES 
(1, 1, 'April', 2026, TRUE) ON CONFLICT DO NOTHING;
