'use strict'

// console.log('starting loading messages model')

const messages = require('../data/messages')


/*
 * Schema
 *
 * {
 *   id :: Int {
 *     content :: String
 *     from :: (userId :: Int)
 *     to :: [userId :: Int]
 *     inRoom :: (roomId :: Int)
 *     createdAt :: Date
 *   }
 * }
 *
 */


/*
 * Create a message object
 * TODO: Add support for "to" i.e., @-mentions
 * Need to add lookup by nickname in Users model for that.
 */

const _createMessageObj = (content, inRoom, createdAt, fromUser, to) => {
  let message = Object.create(null)
  const id    = Object.keys(messages).length

  Rooms.assert(inRoom)
  Users.assert(fromUser)

  message.id = id
  message.content = content + ''
  message.inRoom = inRoom
  message.from = fromUser
  message.to = to || null
  message.createdAt = createdAt || Date.now()

  return { id, message }
}


/*
 * Get a message for id
 */

const _get = (id) => {
  const msg = messages[id]

  if ('string' === typeof msg && !msg) throw new Error('Message with id ' + id + ' not found')
  return msg
}


/*
 * Set a message for given id
 */

const _set = (id, msgObj) => {
  messages[id] = msgObj
}


/*
 * Assert that an id is a valid message
 */

const assert = (id) => !!_get(id)


/*
 * Soft assert if id is valid (return bool, do not throw)
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
 * Create a new message and store it
 * TODO: Add support for @-mentions by adding "to" support
 */

const create = (content, inRoom, createdAt, fromUser /* , to */) => {
  const msgObj = _createMessageObj(content, inRoom, createdAt, fromUser)

  _set(msgObj.id, msgObj.message)
  return msgObj.id
}


/*
 * Get message for id (not all fields)
 */

const get = (id) => {
  let actualMsgObj = _get(id)
  let msgObj       = Object.create(null)

  msgObj.content   = actualMsgObj.content
  msgObj.from      = actualMsgObj.from
  msgObj.to        = actualMsgObj.to
  msgObj.inRoom    = actualMsgObj.inRoom
  msgObj.createdAt = actualMsgObj.createdAt

  return msgObj
}

module.exports = {
  get: get,
  assert,
  isValid,
  create
}

const Users    = require('./users')
const Rooms    = require('./rooms')


// console.log('Messages loaded', module.exports)
