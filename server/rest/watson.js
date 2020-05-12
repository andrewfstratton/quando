module.exports = (app, base64, base64Img, watson_db, fs) => {
  
  //Instance Watson services
  const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1')
  const { IamAuthenticator } = require('ibm-watson/auth');
  const tts = new TextToSpeechV1({
    authenticator: new IamAuthenticator({
      apikey:'pd81TloO8vKeDC2ChI5Cr29NUK87Ak5MGPpiOcQxBLMs',
    }),
    url:'https://api.eu-gb.text-to-speech.watson.cloud.ibm.com/instances/dc0e081f-3e10-4d60-b27a-4291c30d1385',
   
});
  
  // const VisualRecognitionV3 = require('ibm-watson/visual-recognition/v3')
  // const visRec = new VisualRecognitionV3({
  //   version: '2018-03-19',
  //   iam_apikey: 'md2b1cDrwPHQC-a-hJovQnsgdvRyympAfBArw4niQCn9',
  //   url: 'https://gateway.watsonplatform.net/visual-recognition/api'
  // })
  // var ToneAnalyzerV3 = require('ibm-watson/tone-analyzer/v3')
  // var toneAnalyzer = new ToneAnalyzerV3({
  //   version: '2017-09-21',
  //   iam_apikey: 'WcRnTs5agEpG9o_PKiTTQSJK1G7fUpcdodKWuVCJivUh',
  //   url: 'https://gateway-lon.watsonplatform.net/tone-analyzer/api'
  // })
  const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1')
  const stt = new SpeechToTextV1({
    authenticator: new IamAuthenticator({
      apikey: 'replace me',
    }),
    url: 'https://api.eu-gb.speech-to-text.watson.cloud.ibm.com/instances/(replace me)',
    headers: {
        'X-Watson-Learning-Opt-Out': 'true'
      },
  });


  /**
   * New Version of STT
   * get a request from modules > watson
   * TODO: currently only shows the transcript in console.log
   */
  app.post('/watson/SPEECH_from_file_request', (req, res) => {
    console.log('\t Speech to Text successfully called.');
    
    let filename = req.body.filename;
    console.log('filename= ', filename);

    let params = {
      objectMode: true,
      model: 'en-GB_BroadbandModel',
      content_type: ['audio/mp3', 'audio/wav'],
      maxAlternatives: 1
    };

    // create the stream
    var recognizeStream = stt.recognizeUsingWebSocket(params);

    // pipe the audio
    fs.createReadStream(__dirname + '/../../client/media/' + filename).pipe(recognizeStream);

    // listen for events
    recognizeStream.on('data', function (event) {
      onEvent('Data:', event);
    });
    recognizeStream.on('error', function (event) {
      onEvent('Error:', event);
    });
    recognizeStream.on('close', function (event) {
      onEvent('Close:', event);
    });

    // display the events on the console
    function onEvent(name, event) {
      // console.log(name, JSON.stringify(event, null, 1));
      let response = JSON.stringify(event, null, 1);
      let parsed_response = JSON.parse(response);
      try {
        transcript = event["results"][0]["alternatives"][0]["transcript"];
        console.log('transcript = ', transcript);
    }
    catch(err) {
    }
    };

  })

  // Speech to Text
  // Old Version <<<<<
  app.post('/watson/SPEECH_request', (req, res) => {
    console.log('Speech to Text Requested...')
    let data = req.body.data
    watson_db.save(data).then((success) => {
      const dir = __dirname + '/../../client/media/stt/'
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
          console.log('ERROR')
          // console.log(JSON.stringify(event, null, 2))
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





  // //Watson Service Routes

  //Text-To-Speech
  // app.post('/watson/TTS_request', (req, res) => {
  //   let filename = null;
  //   console.log('Text to Speech Requested...')
  //   let text = req.body.text
  //   // let text1 = 'Hello World Hello World Hello World Hello World Hello World TTS success audio written as'
  //   watson_db.save(text).then(
  //     (success) => { 
  //       console.log('AM HERE <<<<<<')
  //       let params = { 
  //         text: text,
  //         accept: 'audio/wav',
  //         voice: 'en-US_AllisonVoice',
  //       }
  //       tts.synthesize(params, function(err, audio) { //handling errors and file
  //         if (err) {
  //           console.log(err)
  //           return
  //         } 
  //         //save output file
  //         // tts.repairWavHeader(audio)
  //         console.log('got here1')
  //         fs.createWriteStream(__dirname + '/../../client/media/'+'myFile'+'.wav', audio)
  //         // audio.pipe(fs.createWriteStream('hello_world.wav'));
  //         fs.writeFileSync(__dirname + '/../../client/media/'+'tried.wav', audio)
  //         console.log('TTS success - audio written as '+success.id+'.wav')
  //         filename = success.id
  //         res.json(filename)
  //         console.log('gothere2')
  //       })
  //     },
  //     (err) => { console.log(err) })
  // })

  /**
   * New Version of TTS 
   */ 
  app.post('/watson/TTS_request', (req, res) => {
    console.log('Text to Speech Requested...');

    let mytext = req.body.text;
    let tag = req.body.tag;
    let params = {
      text: mytext,
      accept: ['audio/wav', 'audio/mp3'],
      voice: 'en-US_AllisonVoice',
    }
    tts
      .synthesize(params, function (err, audio) {
        if (err) {
          console.error('Error in tts.synthesize() ', err);
          return;
        }
        let currentTime = new Date().toJSON();
        let filename = currentTime + '_' + tag + '.wav';
        audio.result.pipe(fs.createWriteStream(__dirname + '/../../client/media/watson/' + filename));
        console.log('Audio file fetched. -> ', filename);
        console.log('\tSaved with tag >>> ', req.body.tag);
      });
  });


  // //Visual-Recognition
  // app.post('/watson/VISREC_request', (req, res) => {
  //   console.log('Visual Recognition Requested...')
  //   let imgData = req.body.imgData
  //   base64Img.img(imgData, __dirname + '/client/media', 'visrec', function(err, filepath) {
  //     let file = fs.createReadStream(__dirname +'/client/media/visrec.png')
  //     let params = { //stuff sent to API
  //       images_file: file
  //     }
  //     //call API
  //     visRec.classify(params, function(err, response) {
  //       if (err) {
  //         console.log(err)
  //       } else {
  //         console.log(JSON.stringify(response, null, 2))
  //         res.json(JSON.stringify(response, null, 2))
  //       }
  //     })
  //   })
  // })

  // //Tone Analyzer
  // app.post('/watson/TONE_request', (req, res) => {
  //   console.log('Tone Analyzer Requested...')
  //   let text = req.body.text
  //   let params = { //stuff sent to API
  //     tone_input: {'text': text},
  //     content_type: 'application/json'
  //   }
  //   toneAnalyzer.tone(params, function (error, toneAnalysis) {
  //     if (error) {
  //       console.log(error)
  //     } else { 
  //       //console.log(JSON.stringify(toneAnalysis, null, 2))
  //       res.json(JSON.stringify(toneAnalysis, null, 2))
  //     }
  //   })
  // })


}
