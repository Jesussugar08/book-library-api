const bcrypt = require('bcrypt')

const tkns = require('jsonwebtoken')

const pool = require('../config/database')

exports.register = async (req, res) => {
    try {
      const {email, password, name} = req.body
        
      const result = await pool.query(
        'SELECT * FROM users where email = $1',
        [email]

      )

      if(result.rows.length > 0){
        return res.status(400).json({
            error: 'Email already exists'
        })
      }

      const passwordHash = await bcrypt.hash(password, 10)

      const newUser = await pool.query(
        'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
        [email, passwordHash, name]
      )

      const token = tkns.sign(
        { userId: newUser.rows[0].id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )
      
      res.status(201).json({
        success: true,
        data: {
          user: newUser.rows[0],
          token: token
        }
      })
  
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }



  //login function
  exports.login = async (req, res) => {
    try {
      
      const {email, password} = req.body

      const result = await pool.query(
        'SELECT * FROM users where email = $1',
        [email]

      ) 
      if(result.rows.length === 0) {
        return res.status(401).json({
          error: 'Invalid credentials'
        })
      }

      const isMatch = await bcrypt.compare(
        password,
        result.rows[0].password_hash
      )
      if(!isMatch){
        return res.status(401).json({
          error: 'Invalid credentials'
        })
      }

      const token = tkns.sign(
        { userId: result.rows[0].id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )
      const { password_hash, ...userWithoutPassword } = result.rows[0]
      res.status(200).json({
        success: true,
        data: {
          user: userWithoutPassword,
          token: token
        }
      })

    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }