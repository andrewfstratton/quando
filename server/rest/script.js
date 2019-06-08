const script = require('../db/script')
const client_deploy = './client/deployed_js/'

module.exports = (app, io, success, fail) => {
  app.post('/script', (req, res) => {
    script.save(req.body.name, req.body.userid, req.body.script).then(
      (doc) => { success(res) },
      (err) => { fail(res, err) })
  })

  app.get('/script/names/:userid', (req, res) => {
    script.getNamesOnOwnerID(req.params.userid).then(
      (list) => { success(res, {'list': list}) },
      (err) => { fail(res, err) })
  })

  app.get('/script/id/:id', (req, res) => {
    let id = req.params.id
    script.getOnId(id).then(
      (result) => { success(res, {'doc': result }) },
      (err) => { fail(res, err) })
  })

  app.delete('/script/id/:id', (req, res) => {
    let id = req.params.id
    if (!req.session.user) {
      fail(res, 'Not Logged in')
    } else {
      script.deleteOnId(id).then(
        (doc) => { success(res) },
        (err) => { fail(res, err) })
    }
  })

  app.delete('/script/name/:name', (req, res) => {
    let name = encodeURI(req.params.name)
    if (!req.session.user) {
      fail(res, 'Not Logged in') 
    } else {
      let userid = req.session.user.id
      script.deleteAllOnName(userid, name).then(
        (doc) => { success(res) },
        (err) => { fail(res, err) })
      }
  })

  app.delete('/script/tidy/:name/id/:id', (req, res) => {
    if (!req.session.user) {
      fail(res, 'Not Logged in')
    } else {
      let id = req.params.id
      let userid = req.session.user.id
      let name = encodeURI(req.params.name) // N.B. Leave name encoded...
      script.tidyOnIdName(userid, id, name).then(
        (doc) => { success(res) },
        (err) => { fail(res, err) })
    }
  })

  app.put('/script/deploy/:filename', (req, res) => {
    let filename = req.params.filename + '.js'
    let script = req.body.javascript
    fs.writeFile(client_deploy + filename, script, (err) => {
      if (!err) {
        success(res)
        io.emit('deploy', {script: filename})
      } else {
        fail(res, 'Failed to deploy script')
      }
    })
  })
}