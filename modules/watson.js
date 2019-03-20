var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
var fs = require('fs');

var tts = new TextToSpeechV1({
  TEXT_TO_SPEECH_API_KEY: 'rRDUgzsh17bWWYS2VesXDCkHIanOQIuE42ccPOI7qivX',
  url: 'https://gateway-lon.watsonplatform.net/text-to-speech/api'
})

function watsonSay(text) { //function to synthesize
  tts.synthesize(
    {
        text: text,
      accept: 'audio/wav'
    },
    function(err, audio) {
      if (err) {
      console.log(err);
      return;
      }
      tts.repairWavHeader(audio);
      fs.writeFileSync('/client/media/tts.wav'); //save output file
      console.log('audio written with a corrected wav header');
    }
    );
  quando.audio('/client/media/tts.wav', false); //play output file
};