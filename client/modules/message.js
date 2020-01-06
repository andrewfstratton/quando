(() => {
  let quando = this['quando']
  if (!quando) {
    alert('Fatal Error: message.js must be included after client.js')
  }
  let self = quando.message = {}

  self.http = (path, txt_val, host='', port=undefined, txt=true, callback) => {
    if (host =='') { host = '127.0.0.1' }
    if (port != undefined) {
      host += ':' + port
    }
    txt_val = (txt?'txt':'val') + '=' + encodeURI(txt_val)
    fetch(`http://${host}/${path}?${txt_val}`, { method: 'GET'
      // body: JSON.stringify({ 
      //   'val':txt_val
      // }),
      // headers: {"Content-Type": "application/json"}
    }).then((resp) => {
        if (resp.status != 200) {
          console.log("Response error status = "+resp.status)
        } else {
          resp.json().then((data) => {
            let val = data.val
            if (txt) { val = data.txt }
            callback(val)
          })
        }
      }
    )
  }

})()
