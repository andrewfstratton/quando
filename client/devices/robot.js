(function () {
    var quando = this['quando']
    if (!quando) {
      alert('Fatal Error: Robot must be included after quando_browser')
    }
    var self = quando.robot = {}

    class vocabList  {
        constructor(listName, vocab) {
          this.listName = listName;
          this.vocab = vocab;
        }
    }

    self._list = [];

    var lastHeight = -2;

    var ARM_LOOKUP = {
        "left": {
          "up": {
            "joint": "LShoulderPitch",
            "halfway": "0",
            "maximum": "-90"
          },
          "down": {
            "joint": "LShoulderPitch",
            "halfway": "0",
            "maximum": "90"
          },
          "out": {
            "joint": "LShoulderRoll",
            "halfway": "30",
            "maximum": "60"
          },
          "in": {
            "joint": "LShoulderRoll",
            "halfway": "0",
            "maximum": "-18"
          }
        },
        "right": {
          "up": {
            "joint": "RShoulderPitch",
            "halfway": "0",
            "maximum": "-90"
          },
          "down": {
            "joint": "RShoulderPitch",
            "halfway": "0",
            "maximum": "90"
          },
          "in": {
            "joint": "RShoulderRoll",
            "halfway": "0",
            "maximum": "18"
          },
          "out": {
            "joint": "RShoulderRoll",
            "halfway": "-30",
            "maximum": "-60"
          }
        }
      };

    function helper_ConvertAngle(angle) {
        return angle * (Math.PI / 180)
    }

    function armJointMovement(joint, angle, speed = 0.5) {
        session.service("ALMotion").done(function (motion) {
            motion.setAngles(joint, angle, speed);            
        }).fail(function (error) {
            console.log("An error occurred:", error);
        });
    }

    function conditional(value) {   
        if(value == "disabled" || value == "Stand") 
            return true;
    }

    self.connect = function(robotIp) {
        session = new QiSession(robotIp);       
        session.socket().on('connect', function () {
            console.log('QiSession connected!');
            session.service("ALAutonomousLife").done(function (al) {
                Promise.resolve(al.getState()).then(conditional).then(function (value){
                    if(!value) {
                        session.service("ALTextToSpeech").done(function (tts) {
                            //tts.say("Please wait whilst I set up. I only do this once after being turned on, or if you have changed my autonomous life state.");
                          }).fail(function (error) {
                            console.log("An error occurred:", error);
                          });
                        al.setState("disabled");
                    }
                })

                session.service("ALMemory").done(function (ALMemory) {            
                    ALMemory.subscriber("AutonomousLife/State").done(function (sub){
                        sub.signal.connect(function(state){
                            session.service("ALRobotPosture").done(function (rp) {
                                Promise.resolve(rp.getPosture()).then(conditional).then(function (value){
                                    if(!value && state == "disabled") {
                                        rp.goToPosture("Stand", 1.0);
                                    }
                                })                    
                            }).fail(function (error) {
                                console.log("An error occurred:", error);
                            });
                        });
                    });     
                });
            }).fail(function (error) {
                console.log("An error occurred:", error);
            });
            // now you can start using your QiSession
          }).on('disconnect', function () {
            console.log('QiSession disconnected!');
          });
    }

    self.say = function(text, extras) {
        session.service("ALAnimatedSpeech").done(function (as) {
            as.say(text);
          }).fail(function (error) {
            console.log("An error occurred:", error);
          });
    }

    self.moveHead = function(direction, angle) {
        var head;
        switch (direction) {
            case 'Down':
                head = 'HeadPitch';
                break;
            case 'Up':
                head = 'HeadPitch';
                angle = -angle;
                break;  
            case 'Left':
                head = 'HeadYaw';
                break;
            case 'Right':
                head = 'HeadYaw';            
                angle = -angle;            
                break;
        }
        session.service("ALMotion").done(function (motion) {
            newAngle = helper_ConvertAngle(angle);
            motion.setAngles(head, newAngle, 0.5);
          }).fail(function (error) {
            console.log("An error occurred:", error);
          });
    }

    self.moveArm = function(arm, direction, angle) {
        console.log("Arm: " + arm + "\nDirection: " + direction + "\nAngle: " + angle);
        var json = ARM_LOOKUP;
        var data = json[arm][direction];
        var armJoint = data["joint"];
        console.log(armJoint);
        var finalAngle = data[angle];
        session.service("ALMotion").done(function (motion) {
            newAngle = helper_ConvertAngle(finalAngle);
            motion.setAngles(armJoint, newAngle, 0.5);
          }).fail(function (error) {
            console.log("An error occurred:", error);
          });
    }

    self.moveLeapArm = function(val, extras) {
        console.log("Value from leap: " + val);
        var output = Math.round((2 + ((val - 0) * (-2 - 2))/(1 - 0)) * 10) / 10;
        console.log("Angle calculated: " + output);

        if(output != lastHeight) {
            lastHeight = output;
        }
        display = "setDisplayStyle"
        setInterval(armJointMovement('LShoulderPitch', lastHeight, 0.5), 100);            
    }

    self.motionHand = function(hand, open) {
        session.service("ALMotion").done(function (motion) {
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

    self.changeAutonomousLife = function(state) {
        session.service("ALAutonomousLife").done(function (al) {
            al.setState(state);
          }).fail(function (error) {
            console.log("An error occurred:", error);
          });
    }

    self.createWordList = function(listName) {
        debugger
        var v = new vocabList(listName, []);
        self._list.push(v);
    }

    self.addToWordList = function(listName, vocab) {
        for (var i = 0; i < self._list.length; i++) {
            if(self._list[i].listName == listName) {
                self._list[i].vocab = self._list[i].vocab.concat(vocab.split(","));
            }
        }       
    }
    

    self.listenForWords = function (listName, confidence, callback, destruct = true) {
        var list;
        for (var i = 0; i < self._list.length; i++) {
            var element = self._list[i];
            if(element.listName == listName) {
                list = element;
            }
        }
        debugger
        quando.robotListen(session, list, confidence, callback, destruct);
        // session.service("ALSpeechRecognition").done(function (sr) {
        //     for (var i = 0; i < self._list.length(); i++) {
        //         var element = self._list[i];
        //         if(element.listName == list) {
        //             sr.setVocabulary(element, false);
        //         }
        //     }
        //     sr.pause(false);
        //     sr.subscribe("NAO_USER");

        //     session.service("ALMemory").done(function (ALMemory) {            
        //         ALMemory.subscriber("WordRecognized").done(function (sub){
        //             sub.signal.connect(function(value){
        //                 if(value[1] > 0.3) {
        //                     console.log("I recognise that word!");
        //                     console.log(value);  
        //                     callback();   
        //                 }               
        //             });
        //         });
        //     });
        //   }).fail(function (error) {
        //     console.log("An error occurred:", error);
        //   }); 
    }

    self.stopListening = function(callback) {
        session.service("ALSpeechRecognition").done(function (sr) {
            sr.unsubscribe("NAO_USER");
        });
    }
})()
