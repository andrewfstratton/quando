const dns = require('dns')

module.exports = (app, appEnv, success, fail) => {
  app.get('/ip', (req, res) => {
    let client_ip = req.ip.replace('::ffff:', '')
    dns.lookup(require('os').hostname(), (err, host_ip) => {
      console.log('Access Server IP: ' + host_ip + ' from Client IP: ' + client_ip)
      let local = appEnv.isLocal // false when running on cloud server
      if (local) {
        local = (client_ip == host_ip) || (client_ip == '127.0.0.1')
      }
      success(res, {'ip': host_ip, 'local': local})
    })
  })
}
