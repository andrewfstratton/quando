const nao = require('../db/nao')

module.exports = (app, success, fail) => {
  app.post('/nao', (req, res) => {
    nao.add(req.body.ip, req.body.name).then(
      (doc) => { success(res) },
      (err) => { fail(res, err) })
  })

  app.get('/nao', (req, res) => {
    nao.getAll().then(
      (doc) => { success(res, doc) },
      (err) => { fail(res, err) })
  })
}
