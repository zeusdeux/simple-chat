/* eslint new-cap: 0 */

'use strict'

const express  = require('express')
const router   = express.Router()

const Users    = require('../models/users')
const Rooms    = require('../models/rooms')
const Messages = require('../models/messages')


/*
 * Validate user. Check if current request has a session that contains a valid userId
 */

const validateUser = (req, res, next) => {
  /*
   * If a non-user tries to create a room, 401 out
   */

  if (req.session.userId && Users.isValid(req.session.userId)) return next()
  else {
    let err401 = new Error('Unauthorized')

    err401.status = 401
    return next(err401)
  }
}


/*
 * GET home page
 * It shows the list of rooms and no.,of people in 'em
 */

router.get('/', (req, res, next) => {
  try {
    // get user from session or create new if one doesn't exist
    const userId       = req.session.userId ? req.session.userId : Users.create(Date.now())
    const userNick     = Users.getNickname(userId)

    // get an array of all rooms and user count in 'em
    const allRoomsObjs = Rooms.getAll().map(room => {
      const temp = Object.create(null)

      temp.id        = room.id
      temp.name      = room.name
      temp.userCount = room.users.length
      temp.createdBy = Users.getNickname(room.createdBy)
      temp.createdByYou = room.createdBy === userId

      return temp
    })

    // set userId and nickname in session
    req.session.userId   = userId
    req.session.nickname = userNick

    if (req.xhr) res.json(allRoomsObjs)
    else {
      res.render('index', {
        userNick: userNick,
        rooms: allRoomsObjs
      })
    }
  }
  catch(e) {
    next(e)
  }
})


/*
 * PUT/POST change user nickname
 */

const updateUserNickname = (req, res, next) => {
  try {
    const newNickname = req.body.nickname

    Users.setNickname(req.session.userId, newNickname)

    req.session.nickname = newNickname

    if (req.xhr) res.sendStatus(200)
    else res.redirect('/')
  }
  catch(e) {
    next(e)
  }
}

router.route('/user/nickname')
  .all(validateUser)
  .put(updateUserNickname)
  .post(updateUserNickname)


/*
 * POST create a new room with given name
 */

router.post('/room/create', validateUser, (req, res, next) => {
  try {
    const name      = req.body.roomname
    const userId    = req.session.userId
    const newRoomId = Rooms.create(name, userId)
    const newRoomUrl = '/room/' + newRoomId

    if (req.xhr) {
      res.location(newRoomUrl)
      res.sendStatus(201)
    }
    else res.redirect(newRoomUrl)
  }
  catch(e) {
    next(e)
  }
})


/*
 * GET join a room given by room id
 */

router.get('/room/:id', validateUser, (req, res, next) => {
  try {
    const roomId     = req.params.id
    const roomName   = Rooms.getName(roomId)

    // add user to room
    Rooms.addUser(roomId, req.session.userId)

    // get nickname of users in room
    const userIds    = Rooms.getUsers(roomId) || []
    const users      = userIds.map(Users.getNickname)

    // get messages in room sorted by created at date
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

    const result = {
      users,
      messages,
      roomId,
      roomName,
      currentUser: req.session.nickname
    }

    if (req.xhr) res.json(result)
    else res.render('chat', result)
  }
  catch(e) {
    next(e)
  }
})


/*
 * POST a new message in a room
 */

router.post('/room/:id', validateUser, (req, res, next) => {
  try {
    const roomId       = req.params.id
    const msgContent   = req.body.message
    const from         = req.session.userId

    // create message
    const createdAt    = Date.now()
    const msgId        = Messages.create(msgContent, roomId, createdAt, from)

    const fromNickname = req.session.nickname || Users.getNickname(from)

    // add message to room
    Rooms.addMessage(roomId, msgId)

    // if xhr, send json otherwise redirect back to chat room
    if (req.xhr) {
      res.json({
        from: fromNickname,
        content: msgContent,
        createdAt
      })
    }
    else res.redirect('/room/' + roomId)
  }
  catch(e) {
    next(e)
  }
})


/*
 * GET Make user leave a room
 */

router.get('/room/:id/leave', validateUser, (req, res, next) => {
  try {
    const roomId = req.params.id
    const userId = req.session.userId

    // remove user from room
    Rooms.removeUser(roomId, userId)

    if (req.xhr) res.sendStatus(200)
    // redirect back to home
    else res.redirect('/')
  }
  catch(e) {
    next(e)
  }
})


/*
 * GET Delete a room
 */

const deleteRoom = (req, res, next) => {
  try {
    const roomId = req.params.id
    const createdBy = Rooms.getCreatedBy(roomId)

    // delete only if user trying to delete had created the room
    if (req.session.userId === createdBy) {
      Rooms.deleteRoom(roomId)

      if (req.xhr) res.sendStatus(200)
      else res.redirect('/')
    }
    else {
      let err403 = new Error('Forbidden. You did not create the room.')

      err403.status = 403

      if (req.xhr) res.sendStatus(err403.status)
      else throw err403
    }
  }
  catch(e) {
    next(e)
  }
}

router.route('/room/:id/delete')
  .all(validateUser)
  .delete(deleteRoom)
  .get(deleteRoom)

module.exports = router
