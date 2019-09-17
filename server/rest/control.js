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
}
