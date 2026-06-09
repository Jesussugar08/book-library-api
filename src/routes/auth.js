const express = require('express')

const router = express.Router()

const controller = require('../controllers/authController')

// Auth routes:
router.post('/register', controller.register )  // Crear cuenta
router.post('/login', controller.login) //verifica el login
module.exports = router

