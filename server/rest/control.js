module.exports = (app) => {
  // let robotjs = false
  let request = require('request') // TODO request is depricated - but this is only for transferring across to java...
  let java = {
    'post': (path) => {
      app.post(path, (req, res) => {
        console.log("FORWARD TO JAVA: " + JSON.stringify(req.body))
        request({
          url: "http://localhost:8080" + path,
          method: "POST", json: true, body: req.body
        }, (error, response, body) => {
          if (error) {
            console.log("Error: " + error)
          } else {
            res.json(response.json)
          }
        })
      })
    }
  }

  java.post('/control/type')
  java.post('/control/key')
  java.post('/control/mouse')

}
