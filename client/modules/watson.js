(function () {
    var quando = this['quando']
    if (!quando) {
      alert('Fatal Error: Watson must be included after quando_browser')
    }
    var self = quando.watson = {}
    self.width = screen.width
    self.height = screen.height
    self.TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
    self.tts = new TextToSpeechV1({})



}) ()