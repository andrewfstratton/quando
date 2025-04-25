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
        let remote = res.remote
        let editor_url = `http://${ip}${port}/editor`
        let client_url = `http://${ip}${port}/client/setup.html`
        let editor_qrcode = document.getElementById('editor_qrcode')
        let client_qrcode = document.getElementById('client_qrcode')
        if (remote) {
          new QRCode(editor_qrcode, {
            text: editor_url, width:160, height:160, correctLevel : QRCode.CorrectLevel.L, colorDark : "#000088", colorLight : "#ffffff",
          })
          editor_qrcode.onclick = () => { window.open('//' + editor_url) }
          new QRCode(client_qrcode, {
            text: client_url, width:160, height:160, correctLevel : QRCode.CorrectLevel.L, colorDark : "#008800", colorLight : "#ffffff",
          })
          client_qrcode.onclick = () => { window.open('//' + client_url) }
        } else {
          editor_qrcode.innerHTML = "<p>remote editor disabled</p><p>run quando with --remote to enable<p>"
            client_qrcode.innerHTML = "<p>remote client disabled</p><p>run quando with --remote to enable<p>"
        }
      } else {
        alert(res.message)
      }
    }).catch((err) => {
      console.log(err)
      alert('Failed to find Quando')
    })
}
 