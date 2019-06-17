const ubit = require('../ubit')

module.exports = (app, io) => {
  ubit.usb(io) // sets up all the usb based micro:bit handling...

  app.post('/ubit/display', (req, res) => {
    ubit.display(req.body.val)
    res.json({})
  })

  app.post('/ubit/icon', (req, res) => {
    ubit.icon(req.body.val)
    res.json({})
  })

  app.post('/ubit/turn', (req, res) => {
    let val = req.body.val
    ubit.turn(val.servo, val.angle)
    res.json({})
  })
}
