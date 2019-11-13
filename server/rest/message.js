const URL = require('url').URL

module.exports = (app, io, https) => {
  app.post('/message/:id', (req, res) => {
    let id = req.params.id
    let val = req.body.val
    let url = null
    try {
      let host = req.body.host
      if (!/^(?:http|ws)(?:s)?:\/\//.test(host)) {
        host = 'https://' + host
      }
      url = new URL(host) 
    } catch (e) { }
    if (url) {
      let data = JSON.stringify({'val':val})
      let options = { 
        hostname: url.hostname, port: url.port, path: '/message/'+id, method: 'POST',
        headers: {
          'Content-Type': 'application/json', 'Content-Length': data.length
        }
      }
      let req = https.request(options, (res) => {
        res.on('data', (d) => {  })
      })
      req.on('error', (error) => {
        console.error(error)
      })
      req.write(data)
      req.end()
    } else {
      let socketId = req.body.socketId
      let local = req.body.local
      _send_message(io, socketId, local, id, val)
    }
    res.json({})
  })
}

_send_message = (io, socketId, local, id, val) => {
  if (local && socketId) {
    io.to(`${socketId}`).emit(id, { val, local })
  } else {
    io.emit(id, { val, local })
  }
}
