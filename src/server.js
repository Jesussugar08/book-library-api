require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.json())

const pool = require('./config/database')
const authRoutes = require('./routes/auth')
const booksRoutes = require('./routes/books')


app.use('/api/books', booksRoutes)
app.use('/api/auth', authRoutes)

app.get('/api/health', (req, res) => {


    res.json({ status: 'OK' })

})


app.listen(5000, () => {
    console.log('Server running on port 5000')
})

