'use strict'
const express = require('express')
const express_static = express.static
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const app = express()
const fs = require('fs')
const body_parser = require('body-parser')
const base64Img = require('base64-img')
const base64 = require('file-base64')
const watson_db = require('./server/db/watson_db')
const join = require('path').join
const http = require('http').Server(app)
const https = require('https')
const io = require('socket.io')(http)

function fail(response, msg) {
  response.json({'success': false, 'message': msg})
}

function success(response, obj = false) {
  if (!obj) {
    obj = {}
  }
  obj.success = true
  response.json(obj)
}

let port = process.env.PORT || 80
let appEnv = require('cfenv').getAppEnv() // For IBM Cloud
if (appEnv.isLocal == false) { // i.e. if running on cloud server
  console.log("INFO: Running on IBM Cloud, port="+port+" >> "+appEnv.port)
  port = appEnv.port // override the port
} else {
  console.log("INFO: Running as Hub, port="+port)
}

function drop_client(client) {
  let index = io.clients.indexOf(client)
  if (index != -1) {
    io.clients.splice(index, 1) // unlike delete, remove the array entry, rather than set to null
  }
}

let server = http.listen(port, () => {
  let host = process.env.IP || server.address().address
  console.log(`Quando Server listening at http://${host}:${server.address().port}`)
  io.clients=[]
  io.broadcast = (msg) => {
    io.clients.forEach(client => {
      client.write(msg + '\n')
    })
  }
  io.on('connection', (client) => {
    console.log('Socket IO connected...')
    io.clients.push(client)
    client.on('error', ()=>{
      console.log('Socket IO error...')
      drop_client(client)
    })
    client.on('timeout', ()=>{
      console.log('Socket IO timeout...')
      drop_client(client)
    })
    client.on('data', (data)=>{
      console.log('Socket IO data...')
      console.log(data.toString())
      client.write('Ok\n')
    })
    client.on('end', ()=>{
      drop_client(client)
      console.log('...Socket IO:closed['+index+']')
    })
  })
})

const MEDIA_FOLDER = join(__dirname, 'client', 'media')
const MEDIA_MAP = {
  //TODO - refactor to videos & images
  'video': ['ogg', 'ogv', 'mp4', 'webm'],
  'audio': ['mp3', 'wav'],
  'images': ['bmp', 'jpg', 'jpeg', 'png', 'gif'],
  'objects': ['gltf', 'glb'], 
  // 'objects': ['obj', 'mtl'],
}
{
  let upload = []
  Object.keys(MEDIA_MAP).map((key)=>{upload = upload.concat(MEDIA_MAP[key])})
  MEDIA_MAP['UPLOAD'] = upload
}

// app.use(require('morgan')('dev'))

app.use(session({
  secret: 'quando_secret',
  resave: false, // i.e. only save when changed
  saveUninitialized: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
        // name: may need this later - if sessions exist for clients...
    httpOnly: false
  },
  store: new MemoryStore({
    checkPeriod: 7 * 24 * 60 * 60 * 1000
  })
}))
app.use('/', (req, res, next) => {
    // console.log(">>" + JSON.stringify(req.session.user))
  next()
})
app.use('/', express_static(join(__dirname, 'hub')))

//increased limit of bp to allow for visrec 
app.use(body_parser.json({ limit: '10mb' }))
app.use(body_parser.urlencoded({ extended: true, limit:'10mb' }))

app.use(body_parser.json())

require('./server/rest/login')(app, success, fail)
require('./server/rest/script')(app, io, success, fail)
require('./server/rest/file')(app, MEDIA_FOLDER, MEDIA_MAP, success, fail)
require('./server/rest/watson')(app, base64, base64Img, watson_db, fs)

// Static for inventor
app.use('/inventor', express_static(join(__dirname, 'inventor')))
app.use('/favicon.ico', express_static(join(__dirname, 'inventor/favicon.ico')))

const client_dir = join(__dirname, 'client')
require('./server/rest/client')(app, client_dir, express_static, success, fail)
require('./server/rest/message')(app, io, https)

app.post('/socket/:id', (req, res) => {
  let id = req.params.id
  let val = req.body.val
  let msg = JSON.stringify({id:id, val:val})
  io_server.broadcast(msg)
  res.json({})
})

require('./server/rest/blocks')(app, __dirname, success, fail)
require('./server/rest/ubit')(app, io)
require('./server/rest/ip')(app, appEnv, success, fail)
require('./server/rest/user')(app, appEnv, success, fail)
require('./server/rest/control')(app)
