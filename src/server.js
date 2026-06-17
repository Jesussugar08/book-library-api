require('dotenv').config()
const express = require('express')
const cors = require('cors') 
const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'https://book-library-frontend-seven.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

const uploadRoutes = require('./routes/upload')
const pool = require('./config/database')
const authRoutes = require('./routes/auth')
const booksRoutes = require('./routes/books')


app.use('/api/books', booksRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/upload', uploadRoutes)
app.get('/api/health', (req, res) => {


    res.json({ status: 'OK' })

})


app.listen(5000, () => {
    console.log('Server running on port 5000')
})



