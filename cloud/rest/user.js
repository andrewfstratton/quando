const user = require('../db/user')
const dns = require('dns')

module.exports = (app, appEnv, success, fail) => {
  app.post('/user', (req, res) => {
    let body = req.body
    if (body.userid && body.password) {
      let client_ip = req.ip.replace('::ffff:', '')
      dns.lookup(require('os').hostname(), (err, host_ip) => {
        let local = appEnv.isLocal // false when running on IBM Cloud
        if (local) {
          local = (client_ip == host_ip) || (client_ip == '127.0.0.1')
        }
        if (local) {
          user.save(body.userid, body.password).then((result) => {
            success(res)
          }, (err) => {
              fail(res, 'Save Error - user probably already exists...')
          })
        } else {
          fail(res, 'Must be run from Quando:Cloud running locally')
        }
      })
    } else {
      fail(res, 'Need UserId and Password')
    }
  })
}