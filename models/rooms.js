/* eslint no-use-before-define: 0 */

'use strict'

let rooms  = require('../data/rooms')
const util = require('../util')


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
  let id   = Object.keys(rooms).length + 1 // 1 indexed ids

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
  if (util.isProd()) throw new Error('Room does not exist')
  else throw new Error('Room for id ' + id + ' not found')
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
 * Delete a room given by id
 */

const deleteRoom = (id) => {
  const room = _get(id)

  // Remove this room from list of rooms for the users in this room
  room.users.forEach(userId => Users.removeRoom(userId, id))

  // Purge messages
  room.messages.forEach(messageId => Messages.deleteMessage(messageId))

  delete rooms[id]
}


/*
 * Get a list of all rooms and users in 'em
 */

const getAll = () => {
  let allRooms = []

  Object.keys(rooms).forEach(roomId => {
    let temp = Object.create(_get(roomId))

    temp.id = roomId
    allRooms.push(temp)
  })

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
 * Get user id of the user who created the room
 */

const getCreatedBy = (id) => {
  const room = _get(id)

  return room.createdBy
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
  deleteRoom,
  getCreatedBy,
  getAll
}


/*
 * These imports are down here to fight closures and cyclic dependencies
 *
 * If these are put on top, then the functions that use Users or Messages
 * get the incomplete User/Messages export object trapped in their closure.
 *
 * This would be an issue if "import" from es6 worked since it imports
 * immutable bindings and not values like require does.
 *
 * Further reading:
 * 1. Cyclic dep resolution in node: https://nodejs.org/api/modules.html#modules_cycles
 * 2. What do es6 modules exports? http://www.2ality.com/2015/07/es6-module-exports.html
 *
 */

const Users    = require('./users')
const Messages = require('./messages')
