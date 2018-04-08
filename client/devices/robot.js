(function () {
    var quando = this['quando']
    if (!quando) {
      alert('Fatal Error: Robot must be included after quando_browser')
    }
    var self = quando.robot = {}

    /** Class instance for holding the lists of 
     * words used in the speech recognition */
    class vocabList  {
        constructor(listName, vocab) {
          this.listName = listName;
          this.vocab = vocab;
        }
    }

    /** Stores the current status of the robots speech */
    var robot = {
        TextToSpeech: {
            CurrentWord: null,      //current word being said
            CurrentSentence: null,  //current sentence being said
            Status: null,           //current status, 0 for not talking 1 if talking
            TextDone: null          //if he has finished speaking
        }
    }

    /** Initial list before being added to the class */
    self._list = [];

    /** Stores data about the arm joint, names and values */
    var ARM_LOOKUP = {
        "left": {
          "up": {
            "joint": "LShoulderPitch",
            "halfway": "0",
            "maximum": "-80",
            "value": 1.5,                               
          },
          "down": {
            "joint": "LShoulderPitch",
            "halfway": "0",
            "maximum": "90",           
          },
          "out": {
            "joint": "LShoulderRoll",
            "halfway": "30",
            "maximum": "60",        
          },
          "in": {
            "joint": "LShoulderRoll",
            "halfway": "0",
            "maximum": "-18",         
          }
        },
        "right": {
          "up": {
            "joint": "RShoulderPitch",
            "halfway": "0",
            "maximum": "-80",
          },
          "down": {
            "joint": "RShoulderPitch",
            "halfway": "0",
            "maximum": "90",        
          },
          "in": {
            "joint": "RShoulderRoll",
            "halfway": "0",
            "maximum": "18",        
          },
          "out": {
            "joint": "RShoulderRoll",
            "halfway": "-30",
            "maximum": "-60",         
          }
        },
        "head": {
            "up": {
                "joint": "HeadPitch",               
            },
            "out": {
                "joint": "HeadYaw",
            }
        }
    };
    
    /** Converts an angle to radians */
    function helper_ConvertAngle(angle) {
        return angle * (Math.PI / 180)
    }

    /** Turns off Nao's auto life and makes him stand up if he isnt */
    function set_up() {
        session.service("ALAutonomousLife").then(function (al) {
            Promise.resolve(al.getState()).then(conditional).then(function (value){
                if(!value) {
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

    /** Reconnects to the robot if it has disconnected */
    function nao_disconnect(robotIp) {
        setTimeout(() => { self.connect(robotIp) }, 1000);
    }

    /** Waits for speech to finish before performing another action when used */
    function waitForSayFinish() {
        if (robot.TextDone == 0) {
            setTimeout(function() { waitForSayFinish() }, 50);
        }
    }

    function execute_leap_executor() {
        var run = setInterval(function() {  leapJointMovement(0.5) }, 0.1 * 1000);        
    }

    /** Listener events for Nao speeking */
    function execute_event_listeners() {
        /** Changed value of the current word being spoken */
        session.service("ALMemory").then(function (ALMemory) {            
            ALMemory.subscriber("ALTextToSpeech/CurrentWord").then(function (sub){
                sub.signal.connect(function(value){
                    robot.TextToSpeech.CurrentWord = value;                      
                });
            });
        });

        /** Changes current sentence */
        session.service("ALMemory").then(function (ALMemory) {            
            ALMemory.subscriber("ALTextToSpeech/CurrentSentence").then(function (sub){
                sub.signal.connect(function(value){
                    console.log(value);
                    robot.TextToSpeech.CurrentSentence = value;                      
                });
            });
        });

        /** Changes speech status */
        session.service("ALMemory").then(function (ALMemory) {            
            ALMemory.subscriber("ALTextToSpeech/Status").then(function (sub){
                sub.signal.connect(function(value){
                    robot.TextToSpeech.Status = value[1];                 
                });
            });
        });

        /** Changes if the robot is finished or not */
        session.service("ALMemory").then(function (ALMemory) {            
            ALMemory.subscriber("ALTextToSpeech/TextDone").then(function (sub){
                sub.signal.connect(function(value){
                    robot.TextToSpeech.TextDone = value;                   
                });
            });
        });
    }

    /**
     * Changes the robots arm position
     * @param {string} joint 
     * @param {number} angle 
     * @param {number} speed 
     */
    function armJointMovement(joint, angle, speed = 0.5) {
        session.service("ALMotion").then(function (motion) {
            motion.setAngles(joint, angle, speed);            
        }).fail(function (error) {
            console.log("An error occurred:", error);
        });
    }

    /**
     * Used to check if the robots auto life is off
     * Also used to check if the robot is standing 
     * @param {boolean} value 
     */
    function conditional(value) {   
        if(value == "disabled" || value == "Stand") 
            return true;
    }

    /**
     * Connects to the robot and sets up the disconnect event
     * @param {string} robotIp The robot uses a string value of the IP address to connect
     */
    self.connect = function(robotIp) {
        session = new QiSession(robotIp);
        globalIP = robotIp;       
        session.socket().on('connect', function () {
            console.log('QiSession connected!');
            set_up();
            execute_event_listeners();                     
          }).on('disconnect', function () {
            console.log('QiSession disconnected!');
            nao_disconnect(globalIP);
          });
    }

    /**
     * Used to make the robot speak, it will interrupt if already speaking
     * @param {string} text The text to say
     * @param {object} extras To interrupt or not
     */
    self.sayInterrupt = function(text, extras) {
        session.service("ALTextToSpeech").then(function (tts) {
            if (robot.TextToSpeech.CurrentSentence != text) {
                tts.stopAll();
                tts.say(text);
            }
          }).fail(function (error) {
            console.log("An error occurred:", error);
          });
    }

    /**
     * Used to make the robot speak, it will queue speech instead of interrupting
     * @param {string} text Text to say
     * @param {object} extras 
     */
    self.say = function(text, extras) {
        session.service("ALTextToSpeech").then(function (tts) {
            if (robot.TextToSpeech.CurrentSentence != text) {
                tts.say(text);
            }
          }).fail(function (error) {
            console.log("An error occurred:", error);
          });
    }

    /**
     * Moves the robots head in the given direction to the given angle
     * @param {string} direction String value holding the direction up/down/in/out
     * @param {number} angle Angle to move to in degrees
     */
    self.moveHead = function(direction, angle) {
        var head;
        switch (direction) {
            case 'down':
                head = 'HeadPitch';
                break;
            case 'up':
                head = 'HeadPitch';
                angle = -angle;
                break;  
            case 'left':
                head = 'HeadYaw';
                break;
            case 'right':
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

    /**
     * Moves the given arm in the given direction to the given angle
     * @param {string} arm Name of the arm
     * @param {string} direction String vlaue holding up/down/in/out
     * @param {number} angle Angle in degrees
     */
    self.moveArm = function(arm, direction, angle) {
        console.log("Arm: " + arm + "\nDirection: " + direction + "\nAngle: " + angle);
        var json = ARM_LOOKUP;
        var data = json[arm][direction];
        var armJoint = data["joint"]; //gets the name of the joint
        console.log(armJoint);         //used for debugging
        var finalAngle = data[angle];
        session.service("ALMotion").then(function (motion) {
            newAngle = helper_ConvertAngle(finalAngle); //converts from degrees to radians
            motion.setAngles(armJoint, newAngle, 0.5); //sets the arm to the angle
          }).fail(function (error) {
            console.log("An error occurred:", error);
          });      
    }

    /**
     * Moves the given motor in the given direction by the given value
     * @param {number} val Value to move to
     * @param {string} motor What motor to move
     * @param {string} direction Direction to move it
     */
    self.moveMotor = function(val, motor, direction) {
        session.service("ALMotion").then(function (motion) {
            newAngle = helper_ConvertAngle(finalAngle);
            motion.setAngles(armJoint, (2 + ((val - 0) * (-2 - 2))/(1 - 0)), 0.5);
          }).fail(function (error) {
            console.log("An error occurred:", error);
          });
    }

    /**
     * open/closes the given hand
     * @param {string} hand Left or Right
     * @param {string} oc Open or Close
     */
    self.motionHand = function(hand, oc) {
        session.service("ALMotion").then(function (motion) {
            if(oc=='Open') {
                motion.openHand(hand);
            } else {
                motion.closeHand(hand);
            }
          }).fail(function (error) {
            console.log("An error occurred:", error);
          });
    }

    /**
     * Starts the person perception
     * @param {function} callback The function to execute if someone is seen
     * @param {boolean} destruct Whether the function needs a destructor
     */
    self.personPerception = function(callback, destruct = true) {
        quando.lookForPerson(session, callback, destruct)
    }

    /**
     * Turns auto life on and off
     * @param {string} state State name
     */
    self.changeAutonomousLife = function(state) {
        session.service("ALAutonomousLife").then(function (al) {
            al.setState(state);
          }).fail(function (error) {
            console.log("An error occurred:", error);
          });
    }

    /**
     * Creates a list with the listName
     * @param {string} listName Name of the list
     */
    self.createWordList = function(listName) {
        var v = new vocabList(listName, []);
        self._list.push(v);
    }

    /**
     * Adds words to the given list name
     * @param {string} listName Name of the list
     * @param {string} vocab Word to add
     */
    self.addToWordList = function(listName, vocab) {
        for (var i = 0; i < self._list.length; i++) {
            if(self._list[i].listName == listName) {
                self._list[i].vocab = self._list[i].vocab.concat(vocab.split(","));
            }
        }       
    }
    
    /**
     * Makes Nao listen for words in a given list
     * @param {string} listName Name of the list to listen for
     * @param {number} confidence Used to change Naos confidence value minimum
     * @param {string} blockID ID number of the block so we can destroy the listen event later
     * @param {function} callback Function to execute if a know word is heard
     * @param {boolean} destruct If the function requires a destructor
     */
    self.listenForWords = function (listName, confidence, blockID, callback, destruct = true) {
        waitForSayFinish();
        var list;
        var fullList = [];
        for (var i = 0; i < self._list.length; i++) {
            var element = self._list[i];
            self._list[i].vocab.forEach(function(word){
                fullList.push(word);
            });
            if(element.listName == listName) {
                list = element;
            }
        }
        quando.robotListen(session, list, fullList, confidence, blockID, callback, destruct);
    }

    /**
     * Starts the events for the touch sensors
     * @param {string} sensor Name of the sensor
     * @param {string} blockID ID number of block so we can destory the listener later
     * @param {function} callback Function to execute when sensor is touched
     * @param {boolean} destruct If a destructor is needed
     */
    self.touchSensor = function (sensor, blockID, callback, destruct = true) {
        quando.touchEvent(session, sensor, blockID, callback, destruct);
    }

    /**
     * Changes Nao's posture to the given one
     * @param {string} p Name of posture
     */
    self.changePosture = function(p) {
        session.service("ALRobotPosture").then(function(posture) {
            posture.goToPosture(p, 1.0)
        }).fail(function(error) {
            console.log("An error occurred:", error)
        })
    }

    /** UNUSED */
    self.stopListening = function(callback) {
        session.service("ALSpeechRecognition").then(function (sr) {
            sr.unsubscribe("NAO_USER");
        });
    }
})()
