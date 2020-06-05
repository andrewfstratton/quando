module.exports = (app) => {
  let robotjs = false
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

  try {
    robotjs = require("robotjs")
    const { spawn } = require('child_process')
    const exe_list = {'word':'start winword', 'file':'explorer.exe'} // N.B. start is need with winword, since it isn't on the path

    app.post('/control/run', (req, res) => {
      let exe = req.body.val
      if (exe_list.hasOwnProperty(exe)) {
        spawn(exe_list[exe], [], {
          shell: true,
          stdio: 'inherit'
        })
      } else {
        console.log(`@@Security Warning - attempt to execute '${exe}'`)
      }
    })

    java.post('/control/type')

    java.post('/control/key')

    function _mouse_click(val, button) {
      if (val.hasOwnProperty(button)) {
        let double_click = false
        if (val[button] == 2) {
          double_click = true
        }
        robotjs.mouseClick(button, double_click)
      }
    }

    app.post('/control/mouse', (req, res) => {
      let val = req.body.val
      let pos = robotjs.getMousePos()
      let display = robotjs.getScreenSize()
      let mouse = {x:pos.x, y:pos.y}
      let smooth = false
      robotjs.setMouseDelay(10)
      if (val.hasOwnProperty('x')) {
        mouse.x = val.x * display.width // N.B. Correctly against screen width
      }
      if (val.hasOwnProperty('y')) {
        mouse.y = (1-val.y) * display.height // Invert automatically...
      }
      if (val.hasOwnProperty('smooth')) {
        smooth = val.smooth
      }
      if (smooth) {
        robotjs.moveMouseSmooth(mouse.x, mouse.y)
      } else {
        robotjs.moveMouse(mouse.x, mouse.y)
      }
      _mouse_click(val, 'left')
      _mouse_click(val, 'middle')
      _mouse_click(val, 'right')
      res.json({})
    })
  } catch (e) {
    if (e.code == 'MODULE_NOT_FOUND') {
      console.log("RobotJS not installed - assuming IBM Cloud, so ignoring.")
    } else {
      throw e
    }
  }
}
