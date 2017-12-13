(function () {
    var quando = this['quando']
    if (!quando) {
      alert('Fatal Error: Robot must be included after quando_browser')
    }

    var session = null;    

    var self = quando.robot = {}
    self.say = function(text, extras) {
        session.service("ALTextToSpeech").done(function (tts) {
            // tts is a proxy to the ALTextToSpeech service
            if(extras.speed) {
                tts.setParameter("speed", extras.speed)
            }
            tts.say(text);
            tts.resetSpeed();
          }).fail(function (error) {
            console.log("An error occurred:", error);
          });
    }

    self.connect = function(robotIp) {
        session = new QiSession(robotIp);       
        session.socket().on('connect', function () {
            console.log('QiSession connected!');
            // now you can start using your QiSession
          }).on('disconnect', function () {
            console.log('QiSession disconnected!');
          });
    }
})()