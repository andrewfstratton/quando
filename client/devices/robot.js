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

    var robot = {
        TextToSpeech: {
            CurrentWord: null,
            Status: null,
            TextDone: null
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

    function set_up() {
        session.service("ALAutonomousLife").then(function (al) {
            Promise.resolve(al.getState()).then(conditional).then(function (value){
                if(!value) {
                    session.service("ALTextToSpeech").then(function (tts) {
                        //tts.say("Please wait whilst I set up. I only do this once after being turned on, or if you have changed my autonomous life state.");
                      }).fail(function (error) {
                        console.log("An error occurred:", error);
                      });
                    al.setState("disabled");
                }
            })

            session.service("ALMemory").then(function (ALMemory) {            
                ALMemory.subscriber("AutonomousLife/State").then(function (sub){
                    sub.signal.connect(function(state){
                        session.service("ALRobotPosture").then(function (rp) {
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
    }

    function nao_disconnect(robotIp) {
        setTimeout(() => { self.connect(robotIp) }, 1000);
    }

    function execute_event_listeners() {
        session.service("ALMemory").then(function (ALMemory) {            
            ALMemory.subscriber("ALTextToSpeech/CurrentWord").then(function (sub){
                sub.signal.connect(function(value){
                  console.log(value);                       
                });
            });
        });

        session.service("ALMemory").then(function (ALMemory) {            
            ALMemory.subscriber("ALTextToSpeech/Status").then(function (sub){
                sub.signal.connect(function(value){
                  console.log(value);                       
                });
            });
        });

        session.service("ALMemory").then(function (ALMemory) {            
            ALMemory.subscriber("ALTextToSpeech/TextDone").then(function (sub){
                sub.signal.connect(function(value){
                  console.log(value);                       
                });
            });
        });
    }

    function armJointMovement(joint, angle, speed = 0.5) {
        session.service("ALMotion").then(function (motion) {
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
            set_up();
            execute_event_listeners();
          }).on('disconnect', function () {
            console.log('QiSession disconnected!');
            nao_disconnect(robotIp);
          });
    }

    self.say = function(text, extras) {
        session.service("ALTextToSpeech").then(function (tts) {
            tts.say(text);
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
        session.service("ALMotion").then(function (motion) {
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
        session.service("ALMotion").then(function (motion) {
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
        session.service("ALMotion").then(function (motion) {
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
        session.service("ALMemory").then(function (ALMemory) {            
            ALMemory.subscriber("ALBasicAwareness/HumanTracked").then(function (sub){
                sub.signal.connect(function(state){
                    console.log("Found You!");
                    callback();
                });
            });     
        });
    }

    self.changeAutonomousLife = function(state) {
        session.service("ALAutonomousLife").then(function (al) {
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
        // session.service("ALSpeechRecognition").then(function (sr) {
        //     for (var i = 0; i < self._list.length(); i++) {
        //         var element = self._list[i];
        //         if(element.listName == list) {
        //             sr.setVocabulary(element, false);
        //         }
        //     }
        //     sr.pause(false);
        //     sr.subscribe("NAO_USER");

        //     session.service("ALMemory").then(function (ALMemory) {            
        //         ALMemory.subscriber("WordRecognized").then(function (sub){
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
        session.service("ALSpeechRecognition").then(function (sr) {
            sr.unsubscribe("NAO_USER");
        });
    }
})()
