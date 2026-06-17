const pool = require('../config/database')

exports.getBooks = async (req, res) => {
  try {
    const userId = req.userId

    const result = await pool.query(
      `SELECT
        books.id,
        title,
        author,
        genre,
        cover_url,
        reading_status.status,
        reading_status.rating,
        reading_status.notes
      FROM books
      LEFT JOIN reading_status ON reading_status.book_id = books.id
      WHERE books.user_id = $1`,
      [userId]
    )

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.createBook = async (req, res) => {
  try {
    const { title, author, genre, year, pages, description, cover_url } = req.body
    const userId = req.userId

    if (!title?.trim() || !author?.trim()) {
      return res.status(400).json({ error: 'Title and author are required' })
    }

    const result = await pool.query(
      `INSERT INTO books(title, author, genre, year, pages, description, cover_url, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title.trim(), author.trim(), genre, year, pages, description, cover_url, userId]
    )

    res.status(201).json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.userId

    const result = await pool.query(
      `SELECT
        books.*,
        reading_status.status,
        reading_status.rating,
        reading_status.notes
      FROM books
      LEFT JOIN reading_status ON reading_status.book_id = books.id
      WHERE books.id = $1 AND books.user_id = $2`,
      [id, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Does not exist' })
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.userId

    const result = await pool.query(
      `DELETE FROM books
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Does not exist' })
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.updateBook = async (req, res) => {
  try {
    const { title, author, genre, year, pages, description } = req.body
    const { id } = req.params
    const userId = req.userId

    if (!title?.trim() || !author?.trim()) {
      return res.status(400).json({ error: 'Title and author are required' })
    }

    const result = await pool.query(
      `UPDATE books
       SET title = $1, author = $2, genre = $3,
           year = $4, pages = $5, description = $6
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [title.trim(), author.trim(), genre, year, pages, description, id, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' })
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.updateStatus = async (req, res) => {
  try {
    const { status, rating, notes } = req.body
    const { id } = req.params
    const userId = req.userId

    const bookCheck = await pool.query(
      `SELECT id FROM books WHERE id = $1 AND user_id = $2`,
      [id, userId]
    )

    if (bookCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Does not exist' })
    }

    const existing = await pool.query(
      `SELECT status, rating, notes FROM reading_status WHERE book_id = $1`,
      [id]
    )

    const current = existing.rows[0]

    if (status === undefined && !current) {
      return res.status(400).json({ error: 'Status is required' })
    }

    const merged = {
      status: status !== undefined ? status : current?.status ?? null,
      rating: rating !== undefined ? rating : current?.rating ?? null,
      notes: notes !== undefined ? notes : current?.notes ?? null,
    }

    const result = await pool.query(
      `INSERT INTO reading_status (book_id, status, rating, notes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (book_id)
       DO UPDATE SET
         status = EXCLUDED.status,
         rating = EXCLUDED.rating,
         notes = EXCLUDED.notes
       RETURNING *`,
      [id, merged.status, merged.rating, merged.notes]
    )

    res.status(200).json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getStats = async (req, res) => {
  try {
    const userId = req.userId

    const result = await pool.query(
      `SELECT
        COUNT(books.id) AS total,
        COUNT(CASE WHEN reading_status.status = 'read' THEN 1 END) AS leidos,
        COUNT(CASE WHEN reading_status.status = 'reading' THEN 1 END) AS leyendo,
        COUNT(CASE WHEN reading_status.status = 'want_to_read' THEN 1 END) AS want_to_read,
        AVG(reading_status.rating) AS promedio
      FROM books
      LEFT JOIN reading_status ON reading_status.book_id = books.id
      WHERE books.user_id = $1`,
      [userId]
    )

    res.status(200).json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
