'use strict'

const app = require('../setupExpress')(require('../routes/restRoutes'))
const port = ~~parseInt(process.env.PORT, 10) || 3000
const d = require('debug')('simple-chat:server')


const server = app.listen(port, function () {
  const host = server.address().address
  const port = server.address().port

  d('Example app listening at http://%s:%s', host, port)
})
