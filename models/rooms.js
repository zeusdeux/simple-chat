'use strict'

// console.log('starting loading rooms model')

let rooms      = require('../data/rooms')


/*
 * Schema
 *
 * {
 *   id :: Int {
 *     name :: String,
 *     users :: [userId :: Int]
 *     messages :: [messageId :: Int]
 *     createdBy :: (userId :: Int)
 *   }
 * }
 *
 */


/*
 * Create a room object with shape given above
 */

const _createRoomObj = (name, createdByUserId) => {
  let room = Object.create(null)
  let id   = Object.keys(rooms).length

  /*
   * Assert that a legit user is tryna create this room
   */

  Users.assert(createdByUserId)

  room.name      = name || 'unknownRoom' + Date.now()
  room.users     = []
  room.messages  = []
  room.createdBy = createdByUserId

  return { id, room }
}


/*
 * Set room for id
 */

const _set = (id, room) => rooms[id] = room


/*
 * Get room based on id
 */

const _get = (id) => {
  const room = rooms[id]

  if (room) return room
  throw new Error('Room for id ' + id + ' not found')
}


/*
 * Throw if room id is invalid
 */

const assert = (id) => !!_get(id)


/*
 * Return true if room id is valid, false otherwise
 */

const isValid = (id) => {
  try {
    return !!_get(id)
  }
  catch(_) {
    return false
  }
}


/*
 * Set room name
 */

const setName = (id, name) => {
  const room = _get(id)

  room.name = name
}


/*
 * Get room name
 */

const getName = (id) => {
  const room = _get(id)

  return room.name
}


/*
 * Append user id to list of users in room
 */

const addUser = (id, userId) => {
  const room = _get(id)

  /*
   * Assert that user exists
   * This will throw if user id is invalid
   */

  Users.assert(userId)

  /*
   * If user is already in room, this will remove the user
   */

  room.users = room.users.filter(user => user !== userId)

  /*
   * Re-add the user. All this just to prevent duplication of userid
   */

  room.users.push(userId)
}


/*
 * Remove user from room
 */

const removeUser = (id, userId) => {
  const room = _get(id)

  room.users = room.users.filter(_userId => _userId !== userId)
}


/*
 * Get users in a room
 */

const getUsers = (id) => {
  const room = _get(id)

  return room.users
}


/*
 * Create room
 * userId is optional. It exists to support auto join for
 * the user who creates the room
 *
 * Note: Before coming here, userId should be validated to check
 * if it is indeed the id of the user who created the room.
 * If that validation isn't done then any user can add, any
 * other user to a room.
 */

const create = (name, createdByUserId) => {
  let roomObj = _createRoomObj(name, createdByUserId)

  _set(roomObj.id, roomObj.room)
  return roomObj.id
}


/*
 * Get a list of all rooms and users in 'em
 */

const getAll = () => {
  let allRooms = []

  Object.keys(rooms).forEach(roomId => allRooms.push(_get(roomId)))

  return allRooms
}



/*
 * Add message to a room
 * Room id and newly created msg id are the params
 */

const addMessage = (id, msgId) => {
  const room = _get(id)

  Messages.assert(msgId)

  room.messages.push(msgId)
}


/*
 * Get messages for a room
 */

const getMessages = (id) => {
  const room = _get(id)

  return room.messages
}


/*
 * TODO:
 * 1. Add support for tracking which user created the room
 * 2. Add support for room deletion by user who created it
 */


module.exports = {
  assert,
  isValid,
  setName,
  getName,
  addUser,
  removeUser,
  getUsers,
  addMessage,
  getMessages,
  create,
  getAll
}

const Users    = require('./users')
const Messages = require('./messages')

// console.log('Rooms loaded', module.exports, Users)
