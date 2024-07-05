let ip = null

function set(id, val) {
  $('#'+id).html(val)
}

function onload() {
  fetch('/ip').then((res) => res.json()).then((res) => {
      if (res.success) {
        ip = res.ip
        set('ip', ip)
        let port = window.location.port
        if (port) {
          port = ":" + port
        }
        let editor_url = `${ip}${port}/editor`
        let client_url = `${ip}${port}/client/setup.html`
        if (res.local == false) { // remote access 
          editor_url = document.location + 'editor'
          client_url = document.location + 'client'
        }
        let editor_qrcode = document.getElementById('editor_qrcode')
        new QRCode(editor_qrcode, {
          text: editor_url, width:160, height:160, correctLevel : QRCode.CorrectLevel.L, colorDark : "#000088", colorLight : "#ffffff",
        })
        editor_qrcode.onclick = () => { window.open('//' + editor_url) }
        client_qrcode = document.getElementById('client_qrcode')
        new QRCode(client_qrcode, {
          text: client_url, width:160, height:160, correctLevel : QRCode.CorrectLevel.L, colorDark : "#008800", colorLight : "#ffffff",
        })
        client_qrcode.onclick = () => { window.open('//' + client_url) }
      } else {
        alert(res.message)
      }
    }).catch((err) => {
      console.log(err)
      alert('Failed to find Quando')
    })
}
 