const bcrypt = require('bcrypt')
const tkns = require('jsonwebtoken')
const pool = require('../config/database')
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns') 
const sns = new SNSClient({ region: 'us-east-1' }) 

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email?.trim() || !password || !name?.trim()) {
      return res.status(400).json({ error: 'Name, email and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [normalizedEmail]
    )

    if (result.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [normalizedEmail, passwordHash, name.trim()]
    )

    const token = tkns.sign(
      { userId: newUser.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    try {
      await sns.send(new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Message: JSON.stringify({
          nombre: newUser.rows[0].name,
          email: newUser.rows[0].email,
        }),
      }))
    } catch (snsError) {
      console.error('SNS publish error:', snsError)
    }

    res.status(201).json({
      success: true,
      data: {
        user: newUser.rows[0],
        token,
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [normalizedEmail]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, result.rows[0].password_hash)

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
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
        token,
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

