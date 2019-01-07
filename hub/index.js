let ip = null

function set(id, val) {
  $('#'+id).html(val)
}

function onload() {
  $.ajax({
    url: '/ip',
    success: (res) => {
      if (res.success) {
        ip = res.ip
        set('ip', ip)
        let inventor_url = `http://${ip}/inventor`
        let client_url = `http://${ip}/client`
        set('inventor_ip', `<a href='${inventor_url}' target='_blank'>${inventor_url}</a>`)
        set('client_ip', `<a href='${client_url}' target='_blank'>${client_url}</a>`)
        new QRCode(document.getElementById('inventor_qrcode'), {
          text: inventor_url, width:160, height:160, correctLevel : QRCode.CorrectLevel.L, colorDark : "#000088", colorLight : "#ffffff",
        })
        new QRCode(document.getElementById('client_qrcode'), {
          text: client_url, width:160, height:160, correctLevel : QRCode.CorrectLevel.L, colorDark : "#008800", colorLight : "#ffffff",
        })
      } else {
        alert(res.message)
      }
    },
    error: () => {
      alert('Failed to find server')
    }
  })
}
 