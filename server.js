'use strict'
const express = require('express')
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const app = express()
const fs = require('fs')
const formidable = require('formidable')
const body_parser = require('body-parser')
const base64Img = require('base64-img');
const script = require('./script')
const client_deploy = './client/deployed_js/'
const user = require('./user')
const path = require('path')
const http = require('http').Server(app)
const https = require('https')
const io = require('socket.io')(http)
const ubit = require('./server/ubit')
const net = require('net')
const dns = require('dns')

//Watson services
const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
const tts = new TextToSpeechV1({
  iam_apikey: 'rRDUgzsh17bWWYS2VesXDCkHIanOQIuE42ccPOI7qivX',
  url: 'https://gateway-lon.watsonplatform.net/text-to-speech/api'
});

const VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
const visRec = new VisualRecognitionV3({
  version: '2018-03-19',
  iam_apikey: 'md2b1cDrwPHQC-a-hJovQnsgdvRyympAfBArw4niQCn9',
  url: 'https://gateway.watsonplatform.net/visual-recognition/api'
});

var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var toneAnalyzer = new ToneAnalyzerV3({
  version: '2017-09-21',
  iam_apikey: 'WcRnTs5agEpG9o_PKiTTQSJK1G7fUpcdodKWuVCJivUh',
  url: 'https://gateway-lon.watsonplatform.net/tone-analyzer/api'
});

var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
var stt = new SpeechToTextV1({
  iam_apikey: 'WiLEvMCQ1hPxKRYtpFo98jYg6jsc2QSnEHx2hfsYiseu',
  url: 'https://gateway-lon.watsonplatform.net/speech-to-text/api'
});

let port = process.env.PORT || 80
let appEnv = require('cfenv').getAppEnv() // For IBM Cloud
if (appEnv.isLocal == false) { // i.e. if running on cloud server
  console.log("INFO: Running on IBM Cloud, port="+port+" >> "+appEnv.port)
  port = appEnv.port // override the port
} else {
  console.log("INFO: Running as Hub, port="+port)
}

let drop_client = (client) => {
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

const MEDIA_FOLDER = path.join(__dirname, 'client', 'media')
const MEDIA_MAP = {
  //TODO - refactor to videos & images
  'video': ['ogg', 'ogv', 'mp4', 'webm'],
  'audio': ['mp3', 'wav'],
  'images': ['bmp', 'jpg', 'jpeg', 'png'],
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
app.use('/', express.static(path.join(__dirname, 'hub')))
app.get('/login', (req, res) => {
  if ((req.session) && (req.session.user)) {
    res.json({ 'success': true, 'userid': req.session.user.id })
  } else {
    res.json({ 'success': false, 'message': 'Not Logged In' })
  }
})

//increased limit of bp to allow for visrec 
app.use(body_parser.json({ limit: '10mb' }));
app.use(body_parser.urlencoded({ extended: true, limit:'10mb' }))

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
  // form.encoding = 'utf-8'
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
      if (!res.headersSent) { // Fix since first response is received
        res.json({ 'success': false, 'message': 'an error has occured with form upload' + err })
      }
    })
  })
  form.on('error', (err) => {
    res.json({ 'success': false, 'message': 'an error has occured with form upload' + err })
  })
  form.on('aborted', (err) => {
    res.json({ 'success': false, 'message': 'Upload cancelled by browser' })
  })
})

// Static for inventor
app.use('/inventor', express.static(path.join(__dirname, 'inventor')))
app.use('/favicon.ico', express.static(path.join(__dirname, 'inventor/favicon.ico')))

// Static for client
let client_dir = path.join(__dirname, 'client')
app.use('/client/media', express.static(path.join(client_dir, 'media')))
app.use('/client/modules', express.static(path.join(client_dir, 'modules')))
app.use('/client/lib', express.static(path.join(client_dir, 'lib')))
app.use('/client/setup', express.static(path.join(client_dir, 'setup.html')))
app.use('/client/client.css', express.static(path.join(client_dir, 'client.css')))
app.use('/client/setup.css', express.static(path.join(client_dir, 'setup.css')))
app.use('/client/client.js', express.static(path.join(client_dir, 'client.js')))
app.use('/client/transparent.png', express.static(path.join(client_dir, 'transparent.png')))
app.use('/client/deployed_js', express.static(path.join(client_dir, 'deployed_js')))
app.use('/client/client.htm', express.static(path.join(client_dir, 'client.htm')))
app.use('/client', express.static(path.join(client_dir, 'index.html')))

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
      let js_files = []
      for(let i=0; i<files.length; i++) {
        if (files[i].endsWith(".js")) {
          js_files.push(files[i])
        }
      }
      dns.lookup(require('os').hostname(), (err, host_ip) => {
        res.json({ 'success': true, ip: host_ip, 'files': js_files })
      })
    } else {
      res.json({
        'success': false,
        'message': 'Failed to retrieve contents of deployed_js folder'
      })
    }
  })
})

app.post('/message/:id', (req, res) => {
  let id = req.params.id
  let val = req.body.val
  let host = req.body.host
  if (host) {
    let data = JSON.stringify({'val':val})
    let options = { hostname: host, port: 443, path: '/message/'+id, method: 'POST',
      headers: {
        'Content-Type': 'application/json', 'Content-Length': data.length
      }
    }
    let req = https.request(options, (res) => {
      res.on('data', (d) => {})
    })
    req.on('error', (error) => {
      console.error(error)
    })
    req.write(data)
    req.end()
  } else {
    io.emit(id, {'val': val})
  }
  res.json({})
})

//WATSON SERVICES

//Text-To-Speech
app.post('/watson/TTS_request', (req, res) => {
  console.log('Text to Speech Requested...')
  let text = req.body.text;
  console.log('TTS Text is: ' + text);
  let params = { //stuff sent to API
    text: text,
    accept: 'audio/wav'
  } 
  tts.synthesize(params, function(err, audio) { //handling errors and file
    if (err) {
      console.log(err);
      return;
    } 
    //save output file
    tts.repairWavHeader(audio);
    fs.writeFileSync(__dirname + '/client/media/tts.wav', audio);
    console.log('TTS - audio written as tts.wav');
    res.json({});
  });
});

//Visual-Recognition
app.post('/watson/VISREC_request', (req, res) => {
  console.log('Visual Recognition Requested...');
  let imgData = req.body.imgData;
  base64Img.img(imgData, __dirname + '/client/media', 'visrec', function(err, filepath) {

    let file = fs.createReadStream(__dirname +'/client/media/visrec.png');
    let params = { //stuff sent to API
      images_file: file
    };
    //call API
    visRec.classify(params, function(err, response) {
      if (err) {
        console.log(err);
      } else {
        //TODO - need to parse out the classification here n pass it back with the socket signal
        console.log(JSON.stringify(response, null, 2));
        res.json(JSON.stringify(response, null, 2));
      };
    });

  });
  //io.emit('VISREC_return', {}) //send socket signal to client saying rec complete
});

//Tone Analyzer
app.post('/watson/TONE_request', (req, res) => {
  console.log('Tone Analyzer Requested...');
  let text = req.body.text;
  let params = { //stuff sent to API
    tone_input: {'text': text},
    content_type: 'application/json'
  };
  toneAnalyzer.tone(params, function (error, toneAnalysis) {
    if (error) {
      console.log(error);
    } else { 
      //console.log(JSON.stringify(toneAnalysis, null, 2));
      res.json(JSON.stringify(toneAnalysis, null, 2));
    }
  })
});

//Speech to Text
app.post('/watson/SPEECH_request', (req, res) => {
  console.log('Speech to Text Requested...');
  var combinedStream = CombinedStream.create();
  combinedStream.append(fs.createReadStream(__dirname + 'audio-file1.wav'));
  combinedStream.append(fs.createReadStream(__dirname + 'audio-file2.wav'));
  
  var params = {
    audio: combinedStream,
    content_type: 'audio/wav',
    timestamps: true,
    word_alternatives_threshold: 0.9
  };
  speechToText.recognize(recognizeParams, function(error, speechRecognitionResults) {
    if (error) {
      console.log(error);
    } else {
      console.log(JSON.stringify(speechRecognitionResults, null, 2));
    }
  });
});

app.post('/socket/:id', (req, res) => {
  let id = req.params.id
  let val = req.body.val
  let msg = JSON.stringify({id:id, val:val})
  io_server.broadcast(msg)
  res.json({})
})

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
            if (!failed && file.endsWith('.htm')) {
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

ubit.usb(io) // sets up all the usb based micro:bit handling...

app.post('/ubit/display', (req, res) => {
  ubit.display(req.body.val)
  res.json({})
})

app.post('/ubit/icon', (req, res) => {
  ubit.icon(req.body.val)
  res.json({})
})

app.post('/ubit/turn', (req, res) => {
  let val = req.body.val
  ubit.turn(val.servo, val.angle)
  res.json({})
})

app.get('/ip', (req, res) => {
  let client_ip = req.ip.replace('::ffff:', '')
  dns.lookup(require('os').hostname(), (err, host_ip) => {
    console.log('Access Server IP: ' + host_ip + ' from Client IP: ' + client_ip)
    let local = appEnv.isLocal // false when running on cloud server
    if (local) {
      local = (client_ip == host_ip) || (client_ip == '127.0.0.1')
    }
    res.json({ 'success': true, 'ip': host_ip, 'local': local})
  })
})

app.post('/user', (req, res) => {
  let body = req.body
  if (body.userid && body.password) {
    let client_ip = req.ip.replace('::ffff:', '')
    dns.lookup(require('os').hostname(), (err, host_ip) => {
      let local = appEnv.isLocal // false when running on cloud server
      if (local) {
        local = (client_ip == host_ip) || (client_ip == '127.0.0.1')
      }
      if (local) {
        user.save(body.userid, body.password).then((result) => {
          res.json({ 'success': true })
        }, (err) => {
          res.json({ 'success': false, 'message': 'Save Error - user probably already exists...' })
        })
      } else {
        res.json({ 'success': false, 'message': 'Must be run from local server'})
      }
    })
  } else {
    res.json({ 'success': false, 'message': 'Need UserId and Password' })
  }
})
