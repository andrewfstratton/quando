const user = require('../db/user')

module.exports = (app, success, fail) => {

  app.get('/login', (req, res) => {
    if ((req.session) && (req.session.user)) {
      success(res, {'userid': req.session.user.id})
    } else {
      fail(res, 'Not Logged In')
    }
  })

  app.post('/login', (req, res) => {
    let body = req.body
    if (body.userid && body.password) {
      user.getOnIdPassword(body.userid, body.password).then((result) => {
        req.session.user = result
        success(res)
      }, (err) => {
        fail(res, 'Login Failed, please try again' + err)
      })
    } else {
      fail(res, 'Need UserId and password')
    }
  })

  app.delete('/login', (req, res) => {
    delete req.session.user
    success(res, {'message': 'Logged Out'})
  })

}