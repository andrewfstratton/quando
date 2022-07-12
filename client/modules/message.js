import * as destructor from "./destructor.js";

let quando = window['quando']
if (!quando) {
  alert('Fatal Error: message.js must be included after client.js')
} else if (!quando.ubit) {
  alert('Fatal Error: message.js must be included after ubit.js')
} else if (!quando.system) {
  alert('Fatal Error: message.js must be included after system.js')
}
let self = quando.message = {}

let io_protocol = "ws"
let port = window.location.port
let message_callback = {}
let message_callback_id = 0
let socket = false

if (['wss:','https:'].includes(window.location.protocol)) {
  io_protocol += "s"
  if (port == 443) {
    port = ''
  }
} else if (port == 80) {
  port = ''
}
if (port != '') {
  port = ":" + port
}

function _connectWebSocket() {
  let ws = new WebSocket(io_protocol + '://' + window.location.hostname + port + "/ws/")

  ws.onclose = (e) => {
    console.log("reconnecting")
    socket = false
    setTimeout(_connectWebSocket, 1000)
  }
  ws.onerror = (e) => {
    console.log("error:"+e)
    ws.close(e)
  }
  ws.onmessage = _handleWebSocketmessage
  socket = ws
}
_connectWebSocket()

function _handleWebSocketmessage(e) {
  const message = JSON.parse(e.data)

  // console.log("message received: " + JSON.stringify(message))
  switch (message.type) {
    case 'deploy':
      let locStr = decodeURIComponent(window.location.href)
      if (locStr.endsWith(message.scriptname + ".html")) {
        window.location.reload(true) // nocache reload - probably not necessary
      }
      break
    case 'message':
      Object.values(message_callback).forEach(item => {
        if (item.message == message.message) {
          let val = message.val
          if (message.txt !== undefined) {
            val = message.txt
          }
          item.callback(val)
        }
      })
      break
    case 'ubit':
      quando.ubit.handle_message(message)
      break
    case 'system':
      quando.system.handle_message(message)
      break
  }
}

self.add_handler = (message, callback) => {
  let message_id = message_callback_id++
  message_callback[message_id] = {"message":message, "callback":callback}
  destructor.add( () => {
    delete message_callback[message_id]
  })
}

self.send = (message, val_txt, val) => {
  if (socket) {
    let json = JSON.stringify({ 
      'type':'message', 'message':message, [val_txt]:val
    })
    socket.send(json)
  }
}
