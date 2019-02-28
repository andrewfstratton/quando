let ip = null

function set(id, val) {
  $('#'+id).html(val)
}

function add_user() {
  let userid = document.getElementById('userid')
  let password = document.getElementById('password')
  $.ajax({
    url: '/user',
    type: 'POST',
    data: { 'userid': userid.value, 'password': password.value },
    success: (res) => {
      if (res.success) {
        set('add_user_message', "Added user '"+userid.value+"'...")
        password.value = ''
        userid.value = ''
      } else {
        set('add_user_message', "Failed to add: " + res.message)
      }
    },
    error: () => {
      set('add_user_message', "Failed to find server")
    }
  })
}

function onload() {
  document.getElementById('add_user_button').onclick = add_user
  $.ajax({
    url: '/ip',
    success: (res) => {
      if (res.success) {
        ip = res.ip
        set('ip', ip)
        let inventor_url = `http://${ip}/inventor`
        let client_url = `http://${ip}/client`
        if (res.local == false) { // remote access 
          inventor_url = './inventor'
          client_url = './client'
        }
        set('inventor_ip', `<a href='${inventor_url}' target='_blank'>${inventor_url}</a>`)
        set('client_ip', `<a href='${client_url}' target='_blank'>${client_url}</a>`)
        new QRCode(document.getElementById('inventor_qrcode'), {
          text: inventor_url, width:160, height:160, correctLevel : QRCode.CorrectLevel.L, colorDark : "#000088", colorLight : "#ffffff",
        })
        new QRCode(document.getElementById('client_qrcode'), {
          text: client_url, width:160, height:160, correctLevel : QRCode.CorrectLevel.L, colorDark : "#008800", colorLight : "#ffffff",
        })
        set('local', (res.local?'Local':'Remote') + ' Access')
        if (res.local) {
          document.getElementById('local_panel').style.visibility = 'visible'
          let pouchdb_url = `http://127.0.0.1:5984/_utils`
          set('pouchdb_utils', `<a href='${pouchdb_url}' target='_blank'>${pouchdb_url}</a>`)
        }
      } else {
        alert(res.message)
      }
    },
    error: () => {
      alert('Failed to find server')
    }
  })
}
 