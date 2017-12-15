(function () {
    var quando = this['quando']
    if (!quando) {
      alert('Fatal Error: Robot must be included after quando_browser')
    }

    var session = null;    

    var self = quando.robot = {}

    self.connect = function(robotIp) {
        session = new QiSession(robotIp);       
        session.socket().on('connect', function () {
            console.log('QiSession connected!');
            // now you can start using your QiSession
          }).on('disconnect', function () {
            console.log('QiSession disconnected!');
          });
    }

    self.say = function(text, extras) {
        session.service("ALAnimatedSpeech").done(function (as) {
            // tts is a proxy to the ALTextToSpeech service
            as.say(text);
          }).fail(function (error) {
            console.log("An error occurred:", error);
          });
    }

    self.motion = function(joint, angle) {
        session.service("ALMotion").done(function (motion) {
            // tts is a proxy to the ALTextToSpeech service
            motion.setAngles(joint, angle, 0.5);
          }).fail(function (error) {
            console.log("An error occurred:", error);
          });
    }

    self.motionHand = function(hand, open) {
        session.service("ALMotion").done(function (motion) {
            // tts is a proxy to the ALTextToSpeech 
            if(hand=='Left') {
                hand = 'LHand';
            } else {
                hand = 'RHand';
            }
            if(open=='Open') {
                motion.openHand(hand);
            } else {
                motion.closeHand(hand);
            }
          }).fail(function (error) {
            console.log("An error occurred:", error);
          });
    }

    self.personPerception = function(callback) {
        session.service("ALMemory").done(function (ALMemory) {            
            ALMemory.subscriber("ALBasicAwareness/HumanTracked").done(function (sub){
                sub.signal.connect(function(state){
                    console.log("Found You!");
                    callback();
                });
            });     
        });
    }
})()