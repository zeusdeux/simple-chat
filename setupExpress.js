'use strict'

const path       = require('path')
const logger     = require('morgan')
const express    = require('express')
const bodyParser = require('body-parser')
const session    = require('express-session')
const util       = require('./util')

const app        = express()


/*
 * Set views folder and view engine
 */

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')


/*
 * Use morgan for logging
 * TODO: Setup log file rotation, etc.
 * See: https://github.com/expressjs/morgan#log-file-rotation
 */

app.use(logger('combined'))


/*
 * Setup request body parsing
 */

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


/*
 * Setup session middleware
 * TODO: Switch from default MemoryStore to RedisStore
 */

app.use(session({
  name: 'simplechatsessid',
  resave: false,
  saveUninitialized: false,
  secret: 'csmexeQQ2x7zpexVR8b0Kpq9HOP1UzAhsq8hKj9lmMPbSVYI1qY6lVKR58l/oOWe/9EEpJA7+M5Fgx2vanN5Ie3MfEzjbp6365CBWAkxskpW+m1w/tboPBS7k3y4sdz44l86lNFjGdbhZ+y9ZY6K+YCZSlhD/0dCl2fthVxs2n8='
}))


/*
 * Setup serving static files
 */

app.use(express.static(path.join(__dirname, 'public')))


/*
 * Export function that will setup routes and error handlers
 * Doing this as diffrent endpoints (REST, GraphQL, Falcor) setup
 * routes differently.
 */

module.exports = (routes) => {
  // mount app routes to /
  app.use('/', routes)

  // setup 404 handler
  app.use((req, res, next) => {
    const err = new Error('Not found!')

    err.status = 404
    return next(err)
  })

  // setup prod and dev error handler
  if (util.isProd()) {
    app.use((err, req, res, _) => {
      res.status(err.status || 500)
      if (req.xhr) res.send()
      else {
        res.render('error', {
          status: err.status || 500,
          message: 'Something went wrong! :(',
          stack: null // don't leak stacktrace to user in prod
        })
      }
    })
  }
  else {
    app.use((err, req, res, _) => {
      res.status(err.status || 500)
      if (req.xhr) res.send()
      else {
        res.render('error', {
          status: err.status || 500,
          message: err.message || 'Broken bruv! :|',
          stack: err.stack.split('\n').join('<br />')
        })
      }
    })
  }
  return app
}
