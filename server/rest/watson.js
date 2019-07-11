module.exports = (app, base64, base64Img, watson_db, fs) => {
  
  //Instance Watson services
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

  //WATSON ASSISTANT STUFF - UNSUSED & UNFINISHED

  // const ass_id = "bb92f3b5-92ef-4fdc-8c8b-7fc7a5f58d53"
  // let ass_session_id = ""
  // const AssistantV2 = require('ibm-watson/assistant/v2');
  // const ass = new AssistantV2({
  //   version: '2019-02-28',
  //   iam_apikey: '6L_VbcL3_3Yi9YcKzbltbahy32xRR1mF7CxGe2kn6hZR',
  //   url: 'https://gateway-lon.watsonplatform.net/assistant/api'
  // });
  
  // function create_assistant_session() {
  //   console.log('creating session...')
  //   ass.createSession({
  //     assistant_id: ass_id
  //   })
  //   .then(res => {
  //     console.log('assistant session id: ' + res.session_id)
  //     ass_session_id = res.session_id
  //   })
  //   .catch(err => {
  //     console.log(err)
  //   })
  // }

  //Assistant
  // app.post('/watson/ASS_request', (req, res) => {
  //   console.log('Assistant Requested...')
  //   create_assistant_session()
    
  //   let text = req.body.text
  //   console.log('text: '  + text)
  //   let id = req.body.id
  //   setTimeout(() => {
  //     console.log('pinging assistant......')
  //     ass.message({
  //       assistant_id: ass_id,
  //       session_id: ass_session_id,
  //       input: {'message_type': 'text',
  //               'text': text}
  //     })
  //     .then(ass_res => {
  //       console.log(ass_res.statusCode)
  //       console.log(ass_res)
  //       console.log(ass_res.output.generic[0].text)
  //       console.log(ass_res.output.intents[0].intent)
  //       console.log(JSON.stringify(ass_res))
  //       res.json("JSON.stringify(ass_res)")
  //     })
  //     .catch(err => {
  //       console.log(err)
  //     })}, 2500)
  // })

  //Watson Service Routes

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
          max_alternatives: 1,
          
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

}
