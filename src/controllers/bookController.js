const pool = require('../config/database')

exports.getBooks = async(req, res) =>{

    try{
        
        const userId = req.userId

        const result = await pool.query(
            `SELECT
                title,
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
    
        const { title, author, genre, year } = req.body

        const userId = req.userId

        const result = await pool.query(
            `INSERT INTO books(title, author, genre, year, user_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING * `,
            [title, author, genre, year, userId]
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