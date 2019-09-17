(() => {
  let quando = this['quando']
  if (!quando) {
    alert('Fatal Error: Control must be included after quando_browser')
  }
  let self = quando.control = {}

  function _send(command, arg) {
    fetch('/control/' + command, { method: 'POST', 
      body: JSON.stringify({'val':arg}), 
      headers: {"Content-Type": "application/json"}
    })
  }

  self.run = (exec) => {
    _send('run', exec)
  }
})()