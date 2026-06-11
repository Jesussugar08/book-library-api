const express = require('express')
const router = express.Router()

const controller = require('../controllers/uploadController')
const authMiddleware = require('../middleware/auth')

router.post('/cover', authMiddleware, controller.uploadSingle, controller.uploadCover )

module.exports = router