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

  function decodeText(str) {
    return str.replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
  }

  self.run = (exec) => {
    _send('run', exec)
  }

  self.type = (str) => {
    _send('type', decodeText(str))
  }

  self.key = (ch, shift=false, ctrl=false, alt=false, command=false, ) => {
    let val = {'key':ch, 'shift':shift, 'ctrl':ctrl, 'alt':alt, 'command':command}
    _send('key', val)
  }
})()