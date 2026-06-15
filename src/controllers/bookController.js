const pool = require('../config/database')

exports.getBooks = async(req, res) =>{

    try{
        
        const userId = req.userId

        const result = await pool.query(
            `SELECT
                books.id,
                title,
                author,
                genre,
                cover_url,
                status,
                rating
            FROM books
            LEFT JOIN reading_status ON reading_status.book_id = books.id
            WHERE books.user_id = $1`,
            [userId]
        )

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        })

    } catch(error){
        res.status(500).json({error: error.message})
    }

}

exports.createBook = async (req, res) => {
    try {
    
        const { title, author, genre, year, pages, description, cover_url } = req.body

        const userId = req.userId

        const result = await pool.query(
            `INSERT INTO books(title, author, genre, year, pages, description, cover_url, user_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING * `,
            [title, author, genre, year, pages, description, cover_url, userId]
        )


        res.status(201).json({
            success: true,
            data: result.rows[0]
        })

  
    } catch(error) {
      res.status(500).json({ error: error.message })
    }
  }

  exports.getBookById = async (req, res) => {
    try {
    
        const {id} = req.params
        const userId = req.userId

        const result = await pool.query(
            `SELECT
                *
             FROM books

             WHERE id = $1 AND user_id = $2

            `,
            [id, userId]
        )
        if(result.rows.length === 0){
            return res.status(404).json({
                error: 'Does not exist'
              })
        }
        res.status(200).json({
            success: true,
            data: result.rows[0]
          })
  
    } catch(error) {
      res.status(500).json({ error: error.message })
    }
  }

  exports.deleteBook = async (req, res) => {
    try {
    
        const {id} = req.params
        const userId = req.userId

        const result = await pool.query(
            `DELETE 
             FROM books
             WHERE id = $1 and user_id = $2 
             RETURNING *
            `,
            [id, userId]
        )
        if(result.rows.length === 0){
            return res.status(404).json({
                error: 'Does not exist'
              })
        }
        res.status(200).json({
            success: true,
            data: result.rows[0]
          })
  
    } catch(error) {
      res.status(500).json({ error: error.message })
    }
  }

  exports.updateBook = async (req, res) => {
    try {
        const { title, author, genre, year, pages, description } = req.body
        const {id} = req.params
        const userId = req.userId

        const result = await pool.query(
            `
            UPDATE books
            SET title = $1, author = $2, genre = $3,
                year = $4, pages = $5, description = $6

            WHERE id = $7 AND user_id = $8
            RETURNING *
            `,
            [title, author, genre, year, pages, description, id, userId]
        )
        if(result.rows.length === 0){
            return res.status(404).json({ error: 'Book not found' })
          }
        
        
        res.status(200).json({
            success: true,
            data: result.rows[0]
          })
  
    } catch(error) {
      res.status(500).json({ error: error.message })
    }
  }

  exports.updateStatus = async (req, res) => {
    try {
        const { status, rating, notes } = req.body
        const {id} = req.params
        const userId = req.userId

        const bookCheck = await pool.query (
            `SELECT
                *
             FROM books
    
             WHERE id = $1 AND user_id = $2
    
            `,
                [id, userId]
            )
        
            if(bookCheck.rows.length === 0){
            return res.status(404).json({
                error: 'Does not exist'
          })}

          const result = await pool.query (
            `
            INSERT INTO reading_status (book_id, status, rating, notes)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (book_id)
            DO UPDATE SET 
                status = $2,
                rating = $3,
                notes = $4
            RETURNING *`,
            [id, status, rating, notes]

        )
        
        
        res.status(200).json({
            success: true,
            data: result.rows[0]
          })
  
    } catch(error) {
      res.status(500).json({ error: error.message })
    }
  }

  exports.getStats = async (req, res) => {
    try {
        
        
        const userId = req.userId

          const result = await pool.query (
            `
            select count(*) as total,     
                count(case when status = 'read' then 1 end) as leidos,     
                count(case when status = 'reading' then 1 end) as leyendo,     
                avg(rating) as promedio 
            from   books 
            join reading_status on reading_status.book_id = books.id
            WHERE books.user_id = $1
            `,
            [userId]
        )
        
        
        res.status(200).json({
            success: true,
            data: result.rows[0]
          })
  
    } catch(error) {
      res.status(500).json({ error: error.message })
    }
  }