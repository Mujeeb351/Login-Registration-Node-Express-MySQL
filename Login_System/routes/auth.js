const express = require('express')
const router = express.Router()
const userController = require('../controllers/users')

router.post('/register', userController.register)
router.post('/index', userController.index)
router.get('/logout', userController.logout)
module.exports = router