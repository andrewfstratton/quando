'use strict'
const express = require('express')
const session = require('express-session')
require('./db').checkDB()
const PouchSession = require('session-pouchdb-store')
const app = express()
const fs = require('fs')
const formidable = require('formidable')
const morgan = require('morgan')
const body_parser = require('body-parser')
const script = require('./script')
const client_deploy = './client/deployed_js/'
const user = require('./user')
const path = require('path')
// require('longjohn')

const router = express.Router()

const http = require('http').Server(app)
const io = require('socket.io')(http)
const ubit = require('./ubit')
const net = require('net')
const SOCKET_PORT = 591
let net_server = net.createServer( (socket)=>{
  let drop_socket = (socket) => {
    let index = net_server.sockets.indexOf(socket)
    if (index != -1) {
      net_server.sockets.splice(index, 1)
    }
  }
  console.log('Socket connected...')
  net_server.sockets.push(socket)
  socket.on('error', ()=>{
  console.log('Socket error...')
    drop_socket(socket)
  })
  socket.on('timeout', ()=>{
  console.log('Socket timeout...')
    drop_socket(socket)
  })
  socket.on('data', (data)=>{
  console.log('Socket data...')
    console.log(data.toString())
    socket.write('Ok\n')
  })
  socket.on('end', ()=>{
    drop_socket(socket)
    console.log('...closed['+index+']')
  })
})
net_server.sockets=[]
net_server.broadcast = (msg) => {
  net_server.sockets.forEach(socket => {
    socket.write(msg + '\n')
  })
}

let server = http.listen(process.env.PORT || 80, () => {
  let host = process.env.IP || server.address().address
  let port = server.address().port
  console.log('Quando Server listening at http://%s:%s', host, port)
})

net_server.listen(SOCKET_PORT, '0.0.0.0', ()=>{
  console.log('Net Socket started on port '+SOCKET_PORT)
})

const MEDIA_FOLDER = path.join(__dirname, 'client', 'media')
const MEDIA_MAP = {
  'video': ['ogg', 'ogv', 'mp4', 'webm'],
  'audio': ['mp3'],
  'images': ['bmp', 'jpg', 'jpeg', 'png'],
  'objects': ['gltf', 'glb'], 
  // 'objects': ['obj', 'mtl'],
}
{
  let upload = []
  Object.keys(MEDIA_MAP).map((key)=>{upload = upload.concat(MEDIA_MAP[key])})
  MEDIA_MAP['UPLOAD'] = upload
}

app.use(morgan('dev'))
// Static for Editor
app.use('/editor', express.static(path.join(__dirname, 'editor')))
app.use('/blockly', express.static(path.join(__dirname, 'blockly')))
app.use('/closure-library', express.static(path.join(__dirname, 'closure-library')))

app.use(session({
  secret: 'quando_secret',
  resave: false, // i.e. only save when changed
  saveUninitialized: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
        // name: may need this later - if sessions exist for clients...
    httpOnly: false
  },
  store: new PouchSession('http://127.0.0.1:5984/session', {
    maxIdle : 12*60*60*1000,
    scavenge : 60*1000,
    purge : 12*60*60*1000			
  })
}))
app.use('/', (req, res, next) => {
    // console.log(">>" + JSON.stringify(req.session.user))
  next()
})
app.get('/login', (req, res) => {
  if ((req.session) && (req.session.user)) {
    res.json({ 'success': true, 'userid': req.session.user.id })
  } else {
    res.json({ 'success': false, 'message': 'Not Logged In' })
  }
})
app.use(body_parser.urlencoded({ extended: true }))
app.use(body_parser.json())
app.post('/login', (req, res) => {
  let body = req.body
  if (body.userid && body.password) {
    user.getOnIdPassword(body.userid, body.password).then((result) => {
      req.session.user = result
      res.json({ 'success': true })
    }, (err) => {
      res.json({ 'success': false, 'message': 'Login Failed, please try again' + err })
    })
  } else {
    res.json({ 'success': false, 'message': 'Need UserId and password' })
  }
})

app.delete('/login', (req, res) => {
  delete req.session.user
  res.json({ 'success': true, 'message': 'Logged Out' })
})

app.post('/script', (req, res) => {
  script.save(req.body.name, req.body.userid, req.body.script).then(
        (doc) => { res.json({ 'success': true }) },
        (err) => { res.json({ 'success': false, 'message': err }) })
})

app.get('/script/names/:userid', (req, res) => {
  script.getNamesOnOwnerID(req.params.userid).then(
        (list) => { res.json({ 'success': true, 'list': list }) },
        (err) => { res.json({ 'success': false, 'message': err }) })
})

app.get('/script/id/:id', (req, res) => {
  let id = req.params.id
  script.getOnId(id).then(
        (result) => { res.json({ 'success': true, 'doc': result }) },
        (err) => { res.json({ 'success': false, 'message': err }) })
})

app.delete('/script/id/:id', (req, res) => {
  let id = req.params.id
  if (!req.session.user) {
    res.json({ 'success': false, 'message': 'Not Logged in' }) 
  } else {
    script.deleteOnId(id).then(
          (doc) => { res.json({ 'success': true }) },
          (err) => { res.json({ 'success': false, 'message': err }) })
  }
})

app.delete('/script/name/:name', (req, res) => {
  let name = encodeURI(req.params.name)
  if (!req.session.user) {
    res.json({ 'success': false, 'message': 'Not Logged in' }) 
  } else {
    let userid = req.session.user.id
    script.deleteAllOnName(userid, name).then(
          (doc) => { res.json({ 'success': true }) },
          (err) => { res.json({ 'success': false, 'message': err }) })
    }
})

app.delete('/script/tidy/:name/id/:id', (req, res) => {
  if (!req.session.user) {
    res.json({ 'success': false, 'message': 'Not Logged in' }) 
  } else {
    let id = req.params.id
    let userid = req.session.user.id
    let name = encodeURI(req.params.name) // N.B. Leave name encoded...
    script.tidyOnIdName(userid, id, name).then(
          (doc) => { res.json({ 'success': true }) },
          (err) => { res.json({ 'success': false, 'message': err }) })
  }
})

app.put('/script/deploy/:filename', (req, res) => {
  let filename = req.params.filename + '.js'
  let script = req.body.javascript
  fs.writeFile(client_deploy + filename, script, (err) => {
    if (!err) {
      res.json({ 'success': true })
      io.emit('deploy', {script: filename})
    } else {
      res.json({ 'success': false, 'message': 'Failed to deploy script' })
    }
  })
})

let reported = false
function ubit_error (err) {
  if (!reported && err) {
    console.log(err)
    reported = true
  }
  setTimeout(() => { ubit.get_serial(ubit_error, ubit_success) }, 1000)
    // Checks every second for plugged in micro:bit
}
function ubit_success (serial) {
  reported = false
  serial.on('data', (data) => {
    try {
      let ubit = JSON.parse(data.trim())
      if (ubit && io) {
        if (ubit.button_a) {
          io.emit('ubit', {button: 'a'})
        }
        if (ubit.button_b) {
          io.emit('ubit', {button: 'b'})
        }
        if (ubit.button_ab) {
          io.emit('ubit', {button: 'a'})
          io.emit('ubit', {button: 'b'})
        }
        if (ubit.ir) {
          io.emit('ubit', {ir: true})
        }
        if (ubit.orientation) {
          io.emit('ubit', {'orientation': ubit.orientation})
        }
        if (ubit.heading) {
          io.emit('ubit', {'heading': ubit.heading})
        }
        if (ubit.roll) {
          io.emit('ubit', {'roll': ubit.roll})
        }
        if (ubit.pitch) {
          io.emit('ubit', {'pitch': ubit.pitch})
        }
      }
    } catch (err) {
      console.log(err + ':' + data)
    }
  })
  serial.on('disconnect', ubit_error)
}

ubit.get_serial(ubit_error, ubit_success)

app.get('/file/type/*', (req, res) => {
  let filename = req.params[0]
  let media = path.basename(filename)
  let folder = filename.substring(0, filename.length - media.length)
  let folderpath = path.join(MEDIA_FOLDER, folder)
  let suffixes = MEDIA_MAP[media] // these are the relevant filename endings - excluding the '.'
  fs.readdir(folderpath, (err, files) => {
    if (!err) {
      let filelist = files.toString().split(',')
      let filtered = []
      let folders = []
      for (let i in filelist) {
        let stat = fs.statSync(path.join(folderpath, filelist[i]))
        if (stat.isDirectory()) {
          folders.push(filelist[i])
        } else {
          for (let s in suffixes) {
            if (filelist[i].toLowerCase().endsWith('.' + suffixes[s])) {
              filtered.push(filelist[i])
            }
          }
        }
      }
      res.json({ 'success': true, 'files': filtered, 'folders': folders })
    } else {
      res.json({ 'success': false, 'message': 'Failed to retrieve contents of folder' })
    }
  })
})

app.post('/file/upload/*', (req, res) => {
  let filename = req.params[0]
  let media = path.basename(filename)
  let folder = filename.substring(0, filename.length - media.length)
  let form = new formidable.IncomingForm()
  form.multiples = true
  form.uploadDir = path.join(MEDIA_FOLDER, folder)
  form.keepExtensions = true
  form.parse(req, (err, fields, files) => {
    if (err) {
      res.json({ 'success': false, 'message': 'failed to upload' })
    } else {
      res.json({ 'success': true })
    }
  })
  form.on('fileBegin', (name, file) => {
    const [fileName, fileExt] = file.name.split('.')
    file.path = path.join(form.uploadDir, `${fileName}_${new Date().getTime()}.${fileExt}`)
  })
  form.on('file', (field, file) => {
    fs.rename(file.path, path.join(form.uploadDir, file.name), (err) => {
      res.json({ 'success': false, 'message': 'an error has occured with form upload' + err })
    })
  })
  form.on('error', (err) => {
    res.json({ 'success': false, 'message': 'an error has occured with form upload' + err })
  })
  form.on('aborted', (err) => {
    res.json({ 'success': false, 'message': 'Upload cancelled by browser' })
  })
})

// Static for client
let client_dir = path.join(__dirname, 'client')
app.use('/client/media', express.static(path.join(client_dir, 'media')))
app.use('/client/devices', express.static(path.join(client_dir, 'devices')))
app.use('/client/modules', express.static(path.join(client_dir, 'modules')))
app.use('/client/lib', express.static(path.join(client_dir, 'lib')))
app.use('/client/setup', express.static(path.join(client_dir, 'setup.html')))
app.use('/client/client.css', express.static(path.join(client_dir, 'client.css')))
app.use('/client/setup.css', express.static(path.join(client_dir, 'setup.css')))
app.use('/client/quando_browser.js', express.static(path.join(client_dir, 'quando_browser.js')))
app.use('/client/transparent.png', express.static(path.join(client_dir, 'transparent.png')))
app.use('/client/favicon.ico', express.static(path.join(client_dir, 'favicon.ico')))
app.use('/client/deployed_js', express.static(path.join(client_dir, 'deployed_js')))

app.get('/client/js/:filename', (req, res) => {
  let filename = req.params.filename
  fs.readFile('./client/client.htm', 'utf8', (err, data) => {
    if (err) {
      res.redirect('/client/setup')
    } else {
      res.write(data.replace(/\[\[TITLE\]\]/,
                filename.replace(/\.js/, '')).replace(/\[\[DEPLOYED_JS\]\]/, filename))
      res.end()
    }
  })
})

app.get('/client/js', (req, res) => {
  fs.readdir(path.join(__dirname, 'client', 'deployed_js'), (err, files) => {
    if (!err) {
      require('dns').lookup(require('os').hostname(), (err, add, fam) => {
        res.json({ 'success': true, ip: add, 'files': files })
      })
    } else {
      res.json({
        'success': false,
        'message': 'Failed to retrieve contents of deployed_js folder'
      })
    }
  })
})

app.use('/client', express.static(path.join(client_dir, 'index.html')))

app.post('/message/:id', (req, res) => {
  let id = req.params.id
  let val = req.body.val
  io.emit(id, {'val': val})
  res.json({})
})

app.get('/socket', (req, res) => {
  res.json({port:SOCKET_PORT})
})

app.post('/socket/:id', (req, res) => {
  let id = req.params.id
  let val = req.body.val
  let socket = net_server.socket
  let msg = JSON.stringify({id:id, val:val})
  net_server.broadcast(msg)
  res.json({})
})

app.use('/inventor', express.static(path.join(__dirname, 'inventor')))
app.use('/common', express.static(path.join(__dirname, 'common')))

app.get('/blocks', (req, res) => {
  fs.readdir(path.join(__dirname, 'blocks'), (err, folders) => {
    if (!err) {
      let blocks = []
      for(let folder of folders) {
        let menu = {title:true}
        let parts = folder.split('_')
        parts.shift() // drop the number
        let name = ''
        let cls = ''
        for(let part of parts) {
          cls += part + '-'
          name += part.charAt(0).toUpperCase() + part.slice(1) + ' '
        }
        menu.name = name.slice(0, -1)
        menu.class = cls.slice(0, -1)
        menu.folder = folder
        blocks.push(menu)
        let files = fs.readdirSync(path.join(__dirname, 'blocks', folder))
        if (files) {
          let failed = false
          for(let file of files) {
            if (!failed) {
              let block = {title:false}
              block.type = file.substring(file.indexOf('_') + 1).slice(0, -4) // drop the number, and the '.htm'
              block.type = block.type.replace(/_/g, '-') // turn _ based filename into - based attribute
              let contents = fs.readFileSync(path.join(__dirname, 'blocks', folder, file))
              if (contents) {
                block.html = contents.toString('utf8')
              } else {
                failed = true
              }
              blocks.push(block)
            }
          }
        }
      } // for
      res.json({ 'success': true, 'blocks': blocks })
    } else {
      res.json({
        'success': false,
        'message': 'Failed to retrieve contents of blocks folder'
      })
    }
  })
})