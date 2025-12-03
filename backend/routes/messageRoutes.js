const express = require('express')
const router = express.Router()
const { getMessages, postMessage } = require('../controllers/messageController')
const { protect } = require('../middleware/authMiddleware')

router.get('/', protect, getMessages)
router.post('/', protect, postMessage)

module.exports = router