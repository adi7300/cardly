const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { addBoard, getBoards, getBoard, deleteBoard, updateBoard } = require('./board.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getBoards)
router.post('/', addBoard)
router.get('/:id', getBoard)
router.delete('/:id', deleteBoard)
router.put('/:id', updateBoard)

module.exports = router