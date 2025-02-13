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
        let remote_client = res.remote_client
        let remote_editor = res.remote_editor
        let editor_url = `${ip}${port}/editor`
        let client_url = `${ip}${port}/client/setup.html`
        if (res.local == false) { // remote access 
          editor_url = document.location + 'editor'
          client_url = document.location + 'client'
        }
        let editor_qrcode = document.getElementById('editor_qrcode')
        if (remote_editor) {
          new QRCode(editor_qrcode, {
            text: editor_url, width:160, height:160, correctLevel : QRCode.CorrectLevel.L, colorDark : "#000088", colorLight : "#ffffff",
          })
          editor_qrcode.onclick = () => { window.open('//' + editor_url) }
        } else {
          editor_qrcode.innerHTML = "<p>remote editor disabled</p><p>run quando with --remote_editor to enable<p>"
        }
        let client_qrcode = document.getElementById('client_qrcode')
        if (remote_client) {
          new QRCode(client_qrcode, {
            text: client_url, width:160, height:160, correctLevel : QRCode.CorrectLevel.L, colorDark : "#008800", colorLight : "#ffffff",
          })
          client_qrcode.onclick = () => { window.open('//' + client_url) }
        } else {
            client_qrcode.innerHTML = "<p>remote client disabled</p><p>run quando with --remote_client to enable<p>"
        }
      } else {
        alert(res.message)
      }
    }).catch((err) => {
      console.log(err)
      alert('Failed to find Quando')
    })
}
 