(() => {
  let quando = this['quando']
  if (!quando) {
    alert('Fatal Error: message.js must be included after client.js')
  }
  let self = quando.message = {}

  self.http = (path, txt_val, host='', port=undefined, txt=true, callback) => {
    if (host =='') { host = '127.0.0.1' }
    if (port) {
      host += ':' + port
    }
    txt_val = (txt?'txt':'val') + '=' + encodeURI(txt_val)
    // Can't use common._Get since that is for inventor and module...
    fetch(`${host}/${path}?${txt_val}`, { method: 'GET'
    }).then((resp) => resp.json()
    ).then((resp) => {
          resp.json().then((data) => {
            let val = data.val
            if (txt) { val = data.txt }
            callback(val)
          })
        }
    )
  }

})()
