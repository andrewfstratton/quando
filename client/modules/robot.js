(() => {
    let quando = this['quando']
    if (!quando) {
        alert('Fatal Error: Robot must be included after quando_browser')
    }
    let self = quando.robot = {}
    let state = { // holds the requested state
        hand : { left:{}, right:{}},
        head : { yaw: {}, pitch: {}},
        shoulder : { left: {roll: {}, pitch: {}}, right: {roll: {}, pitch: {}}}
    }

    class vocabList {
        constructor(listName, vocab) {
            this.listName = listName;
            this.vocab = vocab;
        }
    }

    let robot = {
        TextToSpeech: {
            CurrentWord: null,
            CurrentSentence: null,
            Status: null,
            TextDone: null
        }
    }

    self._list = []
    self._armActionsList = {}

    let ARM_LOOKUP = {
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
        }
    };

    function log_error(err) {
        console.log("Error: " + err)
        setTimeout(updateRobot, 1000) // Try again in a second...
    }

    function helper_ConvertAngleToRads(angle) { //from degree to rads
        return angle * (Math.PI / 180)
    }

    function set_up() {
        session.service("ALAutonomousLife").then(function (al) {
            Promise.resolve(al.getState()).then(conditional).then(function (value) {
                if (!value) {
                    session.service("ALTextToSpeech").then(function (tts) {
                        //tts.say("Please wait whilst I set up. I only do this once after being turned on, or if you have changed my autonomous life state.");
                    }).fail(log_error)
                    // al.setState("disabled") // See if this leaves Robot 'alive'
                }
            })

            session.service("ALMemory").then(function (ALMemory) {
                ALMemory.subscriber("AutonomousLife/State").then(function (sub) {
                    sub.signal.connect(function (state) {
                        session.service("ALRobotPosture").then(function (rp) {
                            Promise.resolve(rp.getPosture()).then(conditional).then(function (value) {
                                if (!value && state == "disabled") {
                                    rp.goToPosture("Stand", 1.0);
                                }
                            })
                        }).fail(log_error)
                    });
                });
            });
        }).fail(log_error)
    }

    function nao_reconnect(robotIp) {
        setTimeout(() => { self.connect(robotIp) }, 1000)
    }

    function waitForSayFinish() {
        if (robot.TextDone == 0) {
            setTimeout(function () { waitForSayFinish() }, 50);
        }
    }

    function execute_leap_executor() {
        var run = setInterval(function () { leapJointMovement(0.5) }, 0.1 * 1000);
    }

    function execute_event_listeners() {
        session.service("ALMemory").then(function (ALMemory) {
            ALMemory.subscriber("ALTextToSpeech/CurrentWord").then(function (sub) {
                sub.signal.connect(function (value) {
                    robot.TextToSpeech.CurrentWord = value;
                });
            });
        });

        session.service("ALMemory").then(function (ALMemory) {
            ALMemory.subscriber("ALTextToSpeech/CurrentSentence").then(function (sub) {
                sub.signal.connect(function (value) {
                    console.log(value);
                    robot.TextToSpeech.CurrentSentence = value;
                });
            });
        });

        session.service("ALMemory").then(function (ALMemory) {
            ALMemory.subscriber("ALTextToSpeech/Status").then(function (sub) {
                sub.signal.connect(function (value) {
                    robot.TextToSpeech.Status = value[1];
                });
            });
        });

        session.service("ALMemory").then(function (ALMemory) {
            ALMemory.subscriber("ALTextToSpeech/TextDone").then(function (sub) {
                sub.signal.connect(function (value) {
                    robot.TextToSpeech.TextDone = value;
                });
            });
        });
    }

    function armJointMovement(joint, angle, speed = 0.5) {
        session.service("ALMotion").then(function (motion) {
            motion.setAngles(joint, angle, speed);
        }).fail(log_error)
    }

    function conditional(value) {
        if (value == "disabled" || value == "Stand")
            return true;
    }
    
    self.connect = (robotIP) => {
        session = new QiSession(robotIP)
        session.socket().on('connect', () => {
            console.log('QiSession connected!')
            set_up()
            execute_event_listeners()
        }).on('disconnect', () => {
            console.log('QiSession disconnected!')
            nao_reconnect(robotIP)
        }).on('connect_error', () => {
            nao_reconnect(robotIP)
        })
    }

    self.say = (text, interrupt=false) => {
        session.service("ALTextToSpeech").then((tts) => {
            if (robot.TextToSpeech.CurrentSentence != text) {
                if (interrupt) {
                    tts.stopAll()
                }
                tts.say(text)
            }
        }).fail(log_error)
    }

    self.changeVoice = (pitch, speed, dblPitch = 0, dblLvl = 0, dblTimeShift = 0) => {
        session.service("ALTextToSpeech").then((tts) => {
            tts.setParameter("pitchShift", pitch)
            tts.setParameter("speed", speed)
            tts.setParameter("doubleVoice", 1)
            tts.setParameter("doubleVoiceLevel", 0.5)
            tts.setParameter("doubleVoiceTimeShift", 0.1)
        }).fail(log_error)
    }


    self.turnHead = (yaw, middle, range, speed, normal_inverted, val) => {
        let min = helper_ConvertAngleToRads(middle - range)
        let max = helper_ConvertAngleToRads(middle + range)
        if (!normal_inverted) { val = 1-val }
        let radians = min + (val * (max-min))
        if (yaw) { // Yaw
            state.head.yaw.angle = radians
            state.head.yaw.speed = speed
        } else { // Pitch
            state.head.pitch.angle = radians
            state.head.pitch.speed = speed
        }
    }

    function updateYawPitch(motion, direction, yaw_pitch) {
        if (yaw_pitch.angle && (yaw_pitch.angle !== yaw_pitch.last_angle)) { // update yaw
            motion.killTasksUsingResources([direction]) // Kill any current motions
            motion.setAngles(direction, yaw_pitch.angle, yaw_pitch.speed/100)
            yaw_pitch.last_angle = yaw_pitch.angle
            yaw_pitch.angle = false
        }
    }

    function updateRobot() {
        session.service("ALMotion").then((motion) => {
            updateYawPitch(motion, 'HeadYaw', state.head.yaw)
            updateYawPitch(motion, 'HeadPitch', state.head.pitch)
            updateHand(motion, 'LHand', state.hand.left)
            updateHand(motion, 'RHand', state.hand.right)
            setTimeout(updateRobot, 1000/25) // i.e. x times per second
        }).fail(log_error)
    }

    self.moveArm = function (arm, direction, angle) {
        console.log("Arm: " + arm + "\nDirection: " + direction + "\nAngle: " + angle);
        var json = ARM_LOOKUP;
        var data = json[arm][direction];
        var armJoint = data["joint"];
        console.log(armJoint);
        var finalAngle = data[angle];
        session.service("ALMotion").then(function (motion) {
            newAngle = helper_ConvertAngleToRads(finalAngle);
            motion.setAngles(armJoint, newAngle, 0.5);
        }).fail(log_error)
    }

    self.moveMotor = function (val, motor, direction) {
        session.service("ALMotion").then(function (motion) {
            newAngle = helper_ConvertAngleToRads(finalAngle);
            motion.setAngles(armJoint, (2 + ((val - 0) * (-2 - 2)) / (1 - 0)), 0.5);
        }).fail(log_error)
    }

    self.stepForwards = function (steps, direction) {
        const stepLength = 0.025; //in M
        session.service("ALMotion").then(function(mProxy) {
            mProxy.moveTo(steps * stepLength * direction, 0, 0)
        })
    }

    self.rotateBody = function (angle, direction) { //angle in degrees
        angle = helper_ConvertAngleToRads(angle)
        session.service("ALMotion").then(function(mProxy) {
            mProxy.moveTo(0, 0, angle * direction)
        })
    }

    self.changeHand = (left, open) => {
        if (left) {
            state.hand.left.open = open
        } else { // right
            state.hand.right.open = open
        }
    }

    function updateHand(motion, hand, left_right) {
        if ((typeof left_right.open === "boolean")
            && (left_right.open !=  left_right.last_open)) { // update
            motion.killTasksUsingResources([hand]) // Kill any current motions
            if (left_right.open) {
                motion.openHand(hand)
            } else {
                motion.closeHand(hand)
            }
            left_right.last_open = left_right.open
            left_right.open = null // clear it...
        }
    }

    self.personPerception = function (callback, destruct = true) {
        self.lookForPerson(session, callback, destruct)
    }

    self.changeAutonomousLife = (state) => {
        session.service("ALAutonomousLife").then((al) => {
            al.setState(state)
        }).fail(log_error)
    }

    self.createWordList = function (listName) {
        var v = new vocabList(listName, []);
        self._list.push(v);
    }

    self.addToWordList = function (listName, vocab) {
        for (var i = 0; i < self._list.length; i++) {
            if (self._list[i].listName == listName) {
                self._list[i].vocab = self._list[i].vocab.concat(vocab.split(","));
            }
        }
    }


    self.listenForWords = function (listName, confidence, blockID, callback, destruct = true) {
        waitForSayFinish();
        var list;
        var fullList = [];
        for (var i = 0; i < self._list.length; i++) {
            var element = self._list[i];
            self._list[i].vocab.forEach(function (word) {
                fullList.push(word);
            });
            if (element.listName == listName) {
                list = element;
            }
        }
        console.log(fullList);
        self.listen(session, list, fullList, confidence, blockID, callback, destruct);
    }

    self.changePosture = (pose, speed) => {
        if (speed <= 0) {
            speed = 1
        } else {
            speed = speed/100
        }
        session.service("ALRobotPosture").then((posture) => {
            posture.goToPosture(pose, speed)
        }).fail(log_error)
    }

    self.stopListening = function (callback) {
        session.service("ALSpeechRecognition").then(function (sr) {
            sr.unsubscribe("NAO_USER");
        });
    }


    /**
   * Class instance to store event disconnector
   * @param {function} disconnect Stores the function used to sidconnect the event
   */
    var disEvent = class {
        constructor(disconnect) { this.disconnect = disconnect }
    }

    /** Stores the disEvents  */
    speechRecognitionEvents = []
    let disconnectSpeechRecognition = false
    /**
     * Starts the listener for the robot listening for words, also creates
     * the disconnect event
     * @param {object} session Stores the connection to the robot
     * @param {strings} list Stores the list of words to respond to
     * @param {number} confidence Stores the confidence value
     * @param {function} callback Function to execute if a word from list is heard
     * @param {object} sr Stores the speech recognition
     */
    function _start_word_recognition(session, list, confidence, callback, sr) {
        session.service("ALMemory").then(function (ALMemory) {
            ALMemory.subscriber("WordRecognized").then(function (sub) {
                sub.signal.connect(function (value) {
                    console.log(value)
                    sr.pause(true)
                    if (value[1] >= confidence) {
                        for (var i = 0; i < list.vocab.length; i++) {
                            if (callback && list.vocab[i] == value[0]) {
                                callback()
                            }
                        }
                    }
                    sr.pause(false)
                }).then(function (processID) {
                    disconnectSpeechRecognition = () => {
                        sub.signal.disconnect(processID)
                    }
                    SRE = new disEvent(disconnectSpeechRecognition)
                    speechRecognitionEvents.push(SRE)
                })
            })
        })
    }

    /**
     * Stops the robot listening 
     * @param {object} session Stores the connection to the robot
     * @param {string} blockID ID of block associated with the current listen event
     */
    function _destroy_robot_listen(session, blockID) {
        session.service("ALSpeechRecognition").then(function (sr) {
            sr.unsubscribe(blockID)
        }).fail(log_error)
        speechRecognitionEvents.forEach(function (SRE) {
            SRE.disconnect()
        })
    }

    /** Stores the person perception event distructors */
    perceptionEvents = []
    let disconnectPerception = false
    /**
     * Makes the robot execute the function if he sees someone
     * Also creates the disconnect event
     * @param {object} session Stores the connection to the robot
     * @param {function} callback Function to execute if the robot sees someone
     * @param {object} ba Basic awareness service
     */
    function _start_perception(session, callback, ba) {
        session.service("ALMemory").then(function (ALMemory) {
            ALMemory.subscriber("ALBasicAwareness/HumanTracked").then(function (sub) {
                sub.signal.connect(function (state) {
                    callback()
                }).then(function (processID) {
                    disconnectPerception = () => {
                        sub.signal.disconnect(processID)
                    }
                    PE = new disEvent(disconnectPerception)
                    perceptionEvents.push(PE)
                })
            })
        })
    }

    /**
     * Destructor for the person perception
     */
    function _destroy_perception() {
        perceptionEvents.forEach(function (PE) {
            PE.disconnect()
        })
        session.service("ALBasicAwareness").then(function (ba) {
            ba.stopAwareness()
            _start_perception(session, callback, ba)
        }).fail(log_error)
    }

    /**
     * 
     * @param {object} session Stores the connection to the robot
     * @param {strings} list Stores the words to listen for 
     * @param {strings} fullList Stores all the lists of strings
     * @param {number} confidence Stores the confidence value for the robot to use
     * @param {string} blockID Stores the blockID for disconnection later
     * @param {function} callback Stores the function to execute
     * @param {boolean} destruct If it needs a destructor or not
     */
    self.listen = function (session, list, fullList, confidence, blockID, callback, destruct = true) {
        session.service("ALSpeechRecognition").then(function (sr) {
            sr.setVocabulary(fullList, false)
            sr.setAudioExpression(false)
            sr.subscribe(blockID)

            _start_word_recognition(session, list, confidence, callback, sr)

        }).fail(log_error)
        if (destruct) {
            self.addDestructor(function () {
                _destroy_robot_listen(session, blockID) //create the destructor
            })
        }
    }

    /**
     * Starts the person perception listener
     * @param {object} session Stores the conneciton to the robot
     * @param {function} callback Function to execute
     * @param {boolean} destruct Whether to create the destructor or not
     */
    self.lookForPerson = function (session, callback, destruct = true) {
        session.service("ALBasicAwareness").then(function (ba) {
            ba.startAwareness()
            _start_perception(session, callback, ba)
        }).fail(log_error)
        if (destruct) {
            self.addDestructor(function () {
                _destroy_perception(session)
            })
        }
    }

    /** Stores the disconnect events for the touchEvents */
    touchEvents = []
    let disconnectTouch = false
    /**
     * Sets up the listener for the touch events
     * Also sets up the disconnector
     * @param {object} session Stores the connection to the robot
     * @param {string} sensor Name of the sensor
     * @param {function} callback Function to execute
     */
    function _start_touchEvents(session, sensor, callback) {
        session.service("ALMemory").then((ALMemory) => {
            ALMemory.subscriber(sensor).then((sub) => {
                // console.log(sub.signal)
                sub.signal.connect((state) => {
                    if (state == 1) {
                        callback()
                    }
                }).then((processID) => {
                    disconnectTouch = () => {
                        sub.signal.disconnect(processID)
                    }
                    let touchEvent = new disEvent(disconnectTouch)
                    touchEvents.push(touchEvent)
                })
            })
        })
    }

    /**
     * Destroys the touch events by executing the disconnectors
     */
    function _destroy_touchEvents() {
        touchEvents.forEach((touchEvent) => {
            touchEvent.disconnect()
        })
        touchEvents = []
    }

    /**
     * Starts the touch events listener
     * @param {string} sensor Stores the sensor to listen to
     * @param {function} callback Stores the function to execute
     */
    self.touchHead = (location, callback) => {
        _start_touchEvents(session, location + 'TactilTouched', callback)
        quando.destructor.add(() => {
            _destroy_touchEvents()
        })
    }

    self.touchHand = (left, location, callback) => {
        let sensor = 'Hand' + (left?'Left':'Right')
        if (location == 'front') {
            sensor += left?'Right':'Left'
        } else if (location == 'back') {
            sensor += left?'Left':'Right'
        } else { // must be 'plate'
            sensor += 'Back'
        }
        sensor += 'Touched'
        _start_touchEvents(session, sensor, callback)
        quando.destructor.add(() => {
            _destroy_touchEvents()
        })
    }

    setTimeout(updateRobot, 1000) // Start in a second
})()
