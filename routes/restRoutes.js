/* eslint new-cap: 0 */

'use strict'

const express  = require('express')
const router   = express.Router()

const Messages = require('../models/messages')
const Users    = require('../models/users')
const Rooms    = require('../models/rooms')


/*
 * GET home page
 * It shows the list of rooms and no.,of people in 'em
 */

router.get('/', (req, res, next) => {
  try {
    const userId = req.session.userId ? req.session.userId : Users.create()
    const userNick = Users.getNickname(userId)
    const allRoomsObjs = Rooms.getAll().map(room => {
      const temp = Object.create(null)

      temp.id        = room.id
      temp.name      = room.name
      temp.userCount = room.users.length

      return temp
    })

    req.session.userId = req.session.userId || userId

    res.render('index', {
      greeting: 'Hi' + userNick + '!',
      rooms: allRoomsObjs
    })
  }
  catch(e) {
    next(e)
  }
})


/*
 * POST create a new room with given name
 */

router.post('/room/create', (req, res, next) => {
  try {
    const name      = req.body.roomname
    const userId    = req.session.userId ? req.session.userId : Users.create()
    const newRoomId = Rooms.create(name, userId)

    req.session.userId = req.session.userId || userId

    res.redirect('/room/' + newRoomId)
  }
  catch(e) {
    next(e)
  }
})


/*
 * GET join a room given by room id
 */

router.get('/room/:id', (req, res, next) => {
  try {
    const userId     = req.session.userId
    const roomId     = req.params.id
    const userIds    = Rooms.getUsers(roomId) || []
    const users      = userIds.map(Users.getNickname)
    const messageIds = Rooms.getMessages(roomId) || []
    const messages   = messageIds
          .map(msgId => {
            const msg      = Messages.get(msgId)
            let temp       = Object.create(null)

            temp.from      = Users.getNickname(msg.from)
            temp.content   = msg.content
            temp.createdAt = msg.createdAt

            return temp
          })
          .sort((a, b) => a.createdAt - b.createdAt)

    res.render('chat', {
      users,
      messages,
      roomId,
      userId
    })
  }
  catch(e) {
    next(e)
  }
})


/*
 * POST a new message in a room
 */

router.post('/room/:id', (req, res, next) => {
  try {
    const msgContent   = req.body.message
    const from         = req.body.userid
    const roomId       = req.params.id
    const createdAt    = Date.now()
    const msgId        = Messages.create(msgContent, roomId, createdAt, from)
    const fromNickname = Users.getNickname(from)

    Rooms.addMessage(roomId, msgId)

    res.json({
      from: fromNickname,
      content: msgContent,
      createdAt
    })
  }
  catch(e) {
    next(e)
  }
})

module.exports = router
