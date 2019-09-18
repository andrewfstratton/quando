module.exports = (app) => {
  let robot = require("robotjs")
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

  app.post('/control/type', (req, res) => {
    let str = decodeURI(req.body.val)
    robot.typeString(str)
    res.json({})
  })

  app.post('/control/key', (req, res) => {
    let val = req.body.val
    let modifier = []
    if (val.shift) { modifer.push('shift') }
    if (val.ctrl) { modifer.push('control') }
    if (val.alt) { modifer.push('alt') }
    if (val.command) { modifer.push('command') }
    robot.keyTap(val.key, modifier)
    res.json({})
  })

  function _mouse_click(val, button) {
    if (val.hasOwnProperty(button)) {
      let double_click = false
      if (val[button] == 2) {
        double_click = true
      }
      robot.mouseClick(button, double_click)
    }
  }

  app.post('/control/mouse', (req, res) => {
    let val = req.body.val
    let pos = robot.getMousePos()
    let display = robot.getScreenSize()
    let mouse = {x:pos.x, y:pos.y}
    let smooth = false
    robot.setMouseDelay(10)
    if (val.hasOwnProperty('x')) {
      mouse.x = val.x * display.width
    }
    if (val.hasOwnProperty('y')) {
      mouse.y = (1-val.y) * display.height // Invert automatically...
    }
    if (val.hasOwnProperty('smooth')) {
      smooth = val.smooth
    }
    if (smooth) {
      robot.moveMouseSmooth(mouse.x, mouse.y)
    } else {
      robot.moveMouse(mouse.x, mouse.y)
    }
    _mouse_click(val, 'left')
    _mouse_click(val, 'middle')
    _mouse_click(val, 'right')
    res.json({})
  })
}
