'use strict'

let users  = require('../data/users')
const util = require('../util')

/*
 * Schema
 *
 * {
 *   id :: Int {
 *     nickname :: String,
 *     rooms :: [roomId :: Int]
 *     createdOn :: Date
 *     lastAccessed :: Date
 *   }
 * }
 *
 */


/*
 * Create a user object with shape describe above
 */

const _createUserObj = (createdOn, nickname, ...roomIds) => {
  let user = Object.create(null)
  let id   = Object.keys(users).length + 1 // 1 indexed ids

  /*
   * Filter invalid room ids
   */

  roomIds = roomIds.filter(roomId => Rooms.isValid(roomId))

  user.nickname = nickname || 'unknownPerson' + Date.now()
  user.rooms = roomIds
  user.createdOn = createdOn || Date.now()
  user.lastAccessed = user.createdOn

  return { id, user }
}


/*
 * Set user for id
 */

const _set = (id, user) => users[id] = user


/*
 * Get user based on id
 */

const _get = (id) => {
  const user = users[id]

  if (!user) {
    if (util.isProd()) throw new Error('User not found')
    else throw new Error('User for id ' + id + ' not found')
  }
  return user
}


/*
 * Throw if user id is invalid
 */

const assert = (id) => !!_get(id)


/*
 * Return true if user id is valid, false otherwise
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
 * Set user nickname
 */

const setNickname = (id, nickname) => {
  const user = _get(id)

  // check if another user with new nickname exists
  const userWithNicknameExists = !!getAll().filter(user => user.nickname === nickname).length

  if (userWithNicknameExists) throw new Error('User with nickname exists')
  else user.nickname = nickname
}


/*
 * Get user nickname
 */

const getNickname = (id) => {
  const user = _get(id)

  return user.nickname
}


/*
 * Add room to user
 * When user joins a room, add it to his/her list of rooms
 */

const addRoom = (id, roomId) => {
  const user = _get(id)

  Rooms.assert(roomId)

  /*
   * To prevent duplicate room ids in list of rooms for user
   * 1. Filter
`  * 2. Push
   */

  user.rooms = user.rooms.filter(room => room !== roomId)
  user.rooms.push(roomId)
}


/*
 * Remove room from list of room that user is in
 */

const removeRoom = (id, roomId) => {
  const user = _get(id)

  Rooms.assert(roomId)

  user.rooms = user.rooms.filter(room => room !== roomId)
}


/*
 * Update last accessed date
 */

const setLastAccessed = (id, lastAccessedDate) => {
  const user = _get(id)

  user.lastAccessed = lastAccessedDate || Date.now()
}


/*
 * Get last accessed date
 */

const getLastAccessed = (id) => {
  const user = _get(id)

  return user.lastAccessed
}


/*
 * Create user
 */

const create = (createdOn, nickname) => {
  let userObj        = _createUserObj(createdOn, nickname)
  const existingUser = getUserByNickname(nickname)

  if (existingUser) return existingUser.id

  _set(userObj.id, userObj.user)
  return userObj.id
}


/*
 * Get the user object by nickname
 */

const getUserByNickname = (nickname) => {
  let user = null

  Object.keys(users).some(userId => {
    const u = _get(userId)

    if (nickname === u.nickname) {
      user = u
      return true
    }
  })

  return user
}


/*
 * Get all the users as array of user objects
 */

const getAll = () => {
  let allUsers = []

  Object.keys(users).forEach(userId => allUsers.push(_get(userId)))

  return allUsers
}


module.exports = {
  assert,
  isValid,
  setNickname,
  getNickname,
  addRoom,
  removeRoom,
  setLastAccessed,
  getLastAccessed,
  create,
  getAll,
  getUserByNickname
}

const Rooms = require('./rooms')
