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