-- Book Library Backend — database schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  genre VARCHAR(255),
  year INTEGER,
  pages INTEGER,
  description TEXT,
  cover_url TEXT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reading_status (
  book_id INTEGER PRIMARY KEY REFERENCES books(id) ON DELETE CASCADE,
  status VARCHAR(50),
  rating NUMERIC,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
