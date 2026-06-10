const express = require('express')

const router = express.Router()

const controller = require('../controllers/bookController')
const authMiddleware = require('../middleware/auth')


router.get('/', authMiddleware, controller.getBooks)
router.post('/', authMiddleware, controller.createBook)
router.get('/:id', authMiddleware, controller.getBookById )
router.delete('/:id', authMiddleware, controller.deleteBook)
router.put('/:id', authMiddleware, controller.updateBook)

module.exports = router