module.exports = (app, io, https) => {
  app.post('/message/:id', (req, res) => {
    let id = req.params.id
    let val = req.body.val
    let host = req.body.host
    if (host) {
      let data = JSON.stringify({'val':val})
      let options = { hostname: host, port: 443, path: '/message/'+id, method: 'POST',
        headers: {
          'Content-Type': 'application/json', 'Content-Length': data.length
        }
      }
      let req = https.request(options, (res) => {
        res.on('data', (d) => {})
      })
      req.on('error', (error) => {
        console.error(error)
      })
      req.write(data)
      req.end()
    } else {
      io.emit(id, {'val': val})
    }
    res.json({})
  })
}
