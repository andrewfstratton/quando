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
      console.log(`@@Attempt to execute '${exe}'`)
    }
  })
}
