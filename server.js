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
const client_deploy = './client/deployed_js/'
const user = require('./server/rest/user')
const path = require('path')
const join = require('path').join
const http = require('http').Server(app)
const https = require('https')
const io = require('socket.io')(http)
const ass_id = "bb92f3b5-92ef-4fdc-8c8b-7fc7a5f58d53"
let ass_session_id = ""

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

//Watson services
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1')
const tts = new TextToSpeechV1({
  iam_apikey: 'rRDUgzsh17bWWYS2VesXDCkHIanOQIuE42ccPOI7qivX',
  url: 'https://gateway-lon.watsonplatform.net/text-to-speech/api'
})

const VisualRecognitionV3 = require('ibm-watson/visual-recognition/v3')
const visRec = new VisualRecognitionV3({
  version: '2018-03-19',
  iam_apikey: 'md2b1cDrwPHQC-a-hJovQnsgdvRyympAfBArw4niQCn9',
  url: 'https://gateway.watsonplatform.net/visual-recognition/api'
})

var ToneAnalyzerV3 = require('ibm-watson/tone-analyzer/v3')
var toneAnalyzer = new ToneAnalyzerV3({
  version: '2017-09-21',
  iam_apikey: 'WcRnTs5agEpG9o_PKiTTQSJK1G7fUpcdodKWuVCJivUh',
  url: 'https://gateway-lon.watsonplatform.net/tone-analyzer/api'
})

var SpeechToTextV1 = require('ibm-watson/speech-to-text/v1')
var stt = new SpeechToTextV1({
  iam_apikey: 'WiLEvMCQ1hPxKRYtpFo98jYg6jsc2QSnEHx2hfsYiseu',
  url: 'https://gateway-lon.watsonplatform.net/speech-to-text/api'
})

const AssistantV2 = require('ibm-watson/assistant/v2');
const ass = new AssistantV2({
  version: '2019-02-28',
  iam_apikey: '6L_VbcL3_3Yi9YcKzbltbahy32xRR1mF7CxGe2kn6hZR',
  url: 'https://gateway-lon.watsonplatform.net/assistant/api'
});


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

function create_assistant_session() {
  console.log('creating session...')
  ass.createSession({
    assistant_id: ass_id
  })
  .then(res => {
    console.log('assistant session id: ' + res.session_id)
    ass_session_id = res.session_id
  })
  .catch(err => {
    console.log(err)
  })
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
    console.log('Socket connected...')
    io.clients.push(client)
    client.on('error', ()=>{
      console.log('Socket error...')
      drop_client(client)
    })
    client.on('timeout', ()=>{
      console.log('Socket timeout...')
      drop_client(client)
    })
    client.on('data', (data)=>{
      console.log('Socket data...')
      console.log(data.toString())
      client.write('Ok\n')
    })
    client.on('end', ()=>{
      drop_client(client)
      console.log('...closed['+index+']')
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

// Static for inventor
app.use('/inventor', express_static(join(__dirname, 'inventor')))
app.use('/favicon.ico', express_static(join(__dirname, 'inventor/favicon.ico')))

const client_dir = join(__dirname, 'client')
require('./server/rest/client')(app, client_dir, express_static, success, fail)
require('./server/rest/message')(app, io, https)

//WATSON SERVICES

//Text-To-Speech
app.post('/watson/TTS_request', (req, res) => {
  let filename = null
  console.log('Text to Speech Requested...')
  let text = req.body.text
  watson_db.save(text).then(
    (success) => { 
      let params = { //stuff sent to API
        text: text,
        accept: 'audio/wav',
      }
      tts.synthesize(params, function(err, audio) { //handling errors and file
        if (err) {
          console.log(err)
          return
        } 
        //save output file
        tts.repairWavHeader(audio)
        fs.writeFileSync(__dirname + '/client/media/'+success.id+'.wav', audio)
        console.log('TTS success - audio written as '+success.id+'.wav')
        filename = success.id
        res.json(filename)
      })
    },
    (err) => { console.log(err) })
})

//Visual-Recognition
app.post('/watson/VISREC_request', (req, res) => {
  console.log('Visual Recognition Requested...')
  let imgData = req.body.imgData
  base64Img.img(imgData, __dirname + '/client/media', 'visrec', function(err, filepath) {
    let file = fs.createReadStream(__dirname +'/client/media/visrec.png')
    let params = { //stuff sent to API
      images_file: file
    }
    //call API
    visRec.classify(params, function(err, response) {
      if (err) {
        console.log(err)
      } else {
        console.log(JSON.stringify(response, null, 2))
        res.json(JSON.stringify(response, null, 2))
      }
    })
  })
})

//Tone Analyzer
app.post('/watson/TONE_request', (req, res) => {
  console.log('Tone Analyzer Requested...')
  let text = req.body.text
  let params = { //stuff sent to API
    tone_input: {'text': text},
    content_type: 'application/json'
  }
  toneAnalyzer.tone(params, function (error, toneAnalysis) {
    if (error) {
      console.log(error)
    } else { 
      //console.log(JSON.stringify(toneAnalysis, null, 2))
      res.json(JSON.stringify(toneAnalysis, null, 2))
    }
  })
})

//Speech to Text
app.post('/watson/SPEECH_request', (req, res) => {
  console.log('Speech to Text Requested...')
  let data = req.body.data
  watson_db.save(data).then((success) => {
    const dir = __dirname + '/client/media/stt/'
    const filePath = dir + success.id + '.webm'

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, '0744');
    }

    base64.decode(data, filePath, function(err, output){
      if (err) { console.log(err); return; }
      var sent = false

      console.log('base 64 decoding success to '+success.id+'.webm')
      var params = {
        objectMode: false,
        content_type: 'audio/webm',
        model: 'en-GB_BroadbandModel',
        max_alternatives: 1
      }
      
      //create speech to text obj
      var recognizeStream = stt.recognizeUsingWebSocket(params)
      recognizeStream.setEncoding('utf8')
      
      // Pipe in the audio.
      fs.createReadStream(filePath).pipe(recognizeStream)

      recognizeStream.once('data', function(event) {
        // Display events on the console.
        console.log(success.id+".webm read as: "+JSON.stringify(event, null, 2))
        if (!sent) {
          sent = true
          res.json(JSON.stringify(event, null, 2))
        }
      })
      recognizeStream.once('error', function(event) {
        // Display events on the console.
        console.log(JSON.stringify(event, null, 2))
      })
      recognizeStream.once('close', function(event) {
        // Display events on the console.
        console.log('closed, '+JSON.stringify(event, null, 2))

        if (!sent) { 
          sent = true
          res.json({ error: true, msg: 'No recognition' })
        }
      })
      
      setTimeout(() => {
        if (!sent) { 
          sent = true
          res.json({ error: true, msg: 'Request timeout' })
        }
      }, 5000)
    })
  })
})

//Assistant
app.post('/watson/ASS_request', (req, res) => {
  console.log('Assistant Requested...')
  create_assistant_session()
  
  let text = req.body.text
  console.log('text: '  + text)
  let id = req.body.id
  setTimeout(() => {
    console.log('pinging assistant......')
    ass.message({
      assistant_id: ass_id,
      session_id: ass_session_id,
      input: {'message_type': 'text',
              'text': text}
    })
    .then(ass_res => {
      console.log(ass_res.statusCode)
      console.log(ass_res)
      console.log(ass_res.output.generic[0].text)
      console.log(ass_res.output.intents[0].intent)
      console.log(JSON.stringify(ass_res))
      res.json("JSON.stringify(ass_res)")
    })
    .catch(err => {
      console.log(err)
    })}, 2500)
})

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
