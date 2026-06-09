const express = require('express')

const router = express.Router()

const controller = require('../controllers/bookController')
const authMiddleware = require('../middleware/auth')


router.get('/', authMiddleware, controller.getBooks)
router.post('/', authMiddleware, controller.createBook)

module.exports = router