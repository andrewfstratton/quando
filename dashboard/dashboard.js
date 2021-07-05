let ip = null

function set(id, val) {
  $('#'+id).html(val)
}

function add_user() {
  let userid = document.getElementById('userid')
  let password = document.getElementById('password')
  fetch('/user',
    { method: 'POST', mode: "no-cors",
        body: JSON.stringify({ userid: userid.value, password: password.value}),
        headers: ({"Content-Type": "text/plain"})
    }).then((res) => res.json()).then((res) => {
      if (res.success) {
        set('add_user_message', "Added user '"+userid.value+"'...")
        password.value = ''
        userid.value = ''
      } else {
        alert("User not created : " + res.message)
      }
    }).catch((err) => {
      set('add_user_message', "Failed to find Quando")
    })
}

function onload() {
  document.getElementById('add_user_button').onclick = add_user
  fetch('/ip').then((res) => res.json()).then((res) => {
      if (res.success) {
        ip = res.ip
        set('ip', ip)
        let port = window.location.port
        if (port) {
          port = ":" + port
        }
        let inventor_url = `${ip}${port}/inventor`
        let client_url = `${ip}${port}/client`
        if (res.local == false) { // remote access 
          inventor_url = document.location + 'inventor'
          client_url = document.location + 'client'
        }
        inventor_qrcode = document.getElementById('inventor_qrcode')
        new QRCode(inventor_qrcode, {
          text: inventor_url, width:160, height:160, correctLevel : QRCode.CorrectLevel.L, colorDark : "#000088", colorLight : "#ffffff",
        })
        inventor_qrcode.onclick = () => { window.open(inventor_url) }
        client_qrcode = document.getElementById('client_qrcode')
        new QRCode(client_qrcode, {
          text: client_url, width:160, height:160, correctLevel : QRCode.CorrectLevel.L, colorDark : "#008800", colorLight : "#ffffff",
        })
        client_qrcode.onclick = () => { window.open(client_url) }
        set('local', (res.local?'Local':'Remote') + ' Access')
        if (res.local) {
          document.getElementById('local_panel').style.visibility = 'visible'
        }
      } else {
        alert(res.message)
      }
    }).catch((err) => {
      console.log(err)
      alert('Failed to find Quando')
    })
}
 