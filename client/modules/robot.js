(() => {
    let quando = this['quando']
    if (!quando) {
        alert('Fatal Error: Robot must be included after quando_browser')
    }
    let self = quando.robot = {}
    let state = { // holds the requested state
        hand : { left: {}, right: {}},
        head : { yaw: {}, pitch: {}},
        shoulder : { left: {roll: {}, pitch: {}}, right: {roll: {}, pitch: {}}}
    }

    let exampleSine = {freq: 441, gain: 25, duration: 1}
    let testSBuffer = [exampleSine, {freq: 480, gain: 25, duration: 1}, {freq: 520, gain: 25, duration: 1}, {freq: 560, gain: 25, duration: 1}, {freq: 600, gain: 25, duration: 1}]
    let sineBuffer = []
    sineBuffer = testSBuffer
    let testCounter = 0
    let sinePlayDelay = 116
    let sinePlaying = false

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
            Status: 'done',
            TextDone: null
        },
        AudioPlayer: {
            playing: false
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
            al.setState('solitary').fail(log_error)

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

    let audioSequence = []
    let audioInterrupt = true

    self.audio = (fileName, scope) => {
        let path = '/home/nao/audio/'

        if (scope == 'interrupt') audioSequence = []
        audioInterrupt = scope == 'interrupt'
        if (scope == 'bg') {
            session.service('ALAudioPlayer').then(ap => {
                ap.playFile(path + fileName).fail(log_error)
            })
        } else {
            audioSequence.push(() => {
                session.service('ALAudioPlayer').then(ap => {
                    robot.AudioPlayer.playing = true
                    ap.playFile(path + fileName).fail(log_error).always(() => {
                        robot.AudioPlayer.playing = false
                    })
                })
            })
        }
        
        quando.destructor.add(function () {
            audioSequence = []
            audioInterrupt = true
        })
    }

    self.speechHandler = (anim, text, pitch, speed, echo, interrupt=false, val) => {
        if (typeof val === 'string' && val.length) {
            text = val
        }

        if (interrupt) audioSequence = []
        audioInterrupt = interrupt
        audioSequence.push(() => {
            self.changeVoice(pitch, speed, echo)
            if (anim == "None") {
                self.say(text)
            } else {
                self.animatedSay(anim, text)
            }
        })
        quando.destructor.add(function () {
            audioSequence = []
            audioInterrupt = true
        })
    }

    self.speechHandlerTest = (anim, text, pitch, speed, echo, interrupt=false) => {
        self.changeVoice(pitch, speed, echo)
        if (anim == "None") {
            self.say(text, interrupt)
        } else {
            self.animatedSay(anim, text, interrupt)
        }
    }


    self.changeVoice = (pitch, speed, echo) => {
        session.service("ALTextToSpeech").then((tts) => {
            tts.setParameter("pitchShift", pitch)
            tts.setParameter("speed", speed)
            if (echo) {
                tts.setParameter("doubleVoice", 1.1)
                tts.setParameter("doubleVoiceLevel", 0.5)
                tts.setParameter("doubleVoiceTimeShift", 0.1)
            } else {
                tts.setParameter("doubleVoice", 1)
                tts.setParameter("doubleVoiceLevel", 0)
                tts.setParameter("doubleVoiceTimeShift", 0.0)
            }
        }).fail(log_error)
    }

    self.say = (text) => {
        session.service("ALTextToSpeech").then((tts) => {
            if (robot.TextToSpeech.CurrentSentence != text) {
                tts.say(text)
            }
        }).fail(log_error)
    }
    
    self.animatedSay = (anim, text) => {
        session.service("ALAnimatedSpeech").then((aas) => {
            if (anim == "Random") {
                aas.setBodyLanguageMode(1) //random body language
            } else {
                aas.setBodyLanguageMode(0) //contextual body language
            }

            if (robot.TextToSpeech.CurrentSentence != text) {
                aas.say(text)
            }
        }).fail(log_error)
    }
        
    //sine handler, governs behaviour with specified type- buffer/interrupt/value
    self.sineHandler = (type, freq, gain, duration) => {
        if (type == "Interrupt") {
            self.playSine(freq, gain, duration)
        } else if (type == "Buffer") {
            self.addSineWaveToBuffer(freq, gain, duration)
        } else if (type == "Val") {
            self.playSineV(val)
        }
    }

    self.goThroughSineBuffer = () => {
        if (sineBuffer.length > 0) { //if there's a tone that needs playing
            sinePlaying = true
            testCounter += 1

            //intermediary variables for simplicity
            let sine = sineBuffer[0]
            let freq = sine.freq
            let gain = sine.gain
            let duration = sine.duration

            //play sine
            session.service("ALAudioDevice").then((aadp) => {
                console.log('Playing Sine wave: ' + freq + "Hz " + gain + " gain " + duration + " seconds counter:" + testCounter)
                aadp.playSine(freq, gain, 0, duration)
            }).fail(log_error)

            sineBuffer.shift() //remove played sine wave
            //wait till wave is over + delay, then call itself again
            window.setTimeout(self.goThroughSineBuffer, duration*1000 + sinePlayDelay)
        } else {
            console.log('nothing left to play!')
            sinePlaying = false
        }
    }

    //play sine wave w.r.t. value
    self.playSineV = (val) => {
        console.log(val)
        session.service("ALAudioDevice").then((aadp) => {
            console.log('Playing Sine wave...')
            aadp.playSine(600*val, 50, 0, 0.1)
        }).fail(log_error)
    }

    //play sine wave w/specified params
    self.playSine = (freq, gain, duration) => {
        session.service("ALAudioDevice").then((aadp) => {
            console.log('Playing Sine wave: ' + freq + "Hz " + gain + " gain " + duration + " seconds counter:" + testCounter)
            aadp.playSine(freq, gain, 0, duration)
        }).fail(log_error)
    } 


    self.addSineWaveToBuffer = (freq, gain, duration) => {
        sineBuffer.push({freq: freq, gain: gain, duration: duration})
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

    self.moveArmNew = (left, roll, middle, range, speed, normal_inverted, val) => {
        let min = helper_ConvertAngleToRads(middle - range)
        let max = helper_ConvertAngleToRads(middle + range)
        if (!normal_inverted) { val = 1-val }
        let radians = min + (val * (max-min))
        if (left) { // Update Left Arm
            if (roll) { // Roll
                state.shoulder.left.roll.angle = radians
                state.shoulder.left.roll.speed = speed
            } else { // Pitch
                state.shoulder.left.pitch.angle = radians
                state.shoulder.left.pitch.speed = speed
            }
        } else { // Update Right Arm
            if (roll) { // Roll
                state.shoulder.right.roll.angle = radians
                state.shoulder.right.roll.speed = speed
            } else { // Pitch
                state.shoulder.right.pitch.angle = radians
                state.shoulder.right.pitch.speed = speed
            }
        }
    }

    self.initVideoStream = () => {
        session.service("ALVideoDevice").then((avd) => {
            console.log(avd.getActiveCamera())
            let cam = avd.subscribeCamera("subscriberID", 0, "kVGA", "kRGB", 10).then((camera) => {
                console.log('TESst'+camera)
            }).fail(log_error) 
            //subscriberID, resolution, colour space, fps
            console.log("cam: "+cam)
            let results = avd.getImageRemote(cam)
            console.log("res: "+results)
            imgData = results[6]
            console.log("imgdata: "+imgData)
        }).fail(log_error)
    }

    function updateYawPitch(motion, joint, yaw_pitch) {
        if (yaw_pitch.angle && (yaw_pitch.angle !== yaw_pitch.last_angle)) { // update yaw
            motion.killTasksUsingResources([joint]) // Kill any current motions
            motion.setAngles(joint, yaw_pitch.angle, yaw_pitch.speed/100)
            yaw_pitch.last_angle = yaw_pitch.angle
            yaw_pitch.angle = false
        }
    }

    function updateJoint(motion, joint, pitch_roll) {
        if (pitch_roll.angle && (pitch_roll.angle !== pitch_roll.last_angle)) { // update yaw
            motion.setAngles(joint, pitch_roll.angle, pitch_roll.speed/100)
            pitch_roll.last_angle = pitch_roll.angle
            pitch_roll.angle = false
        }
    }

    function updateMovement(motion) {
        motion.moveIsActive().then((active) => {
            if (motionSequence.length) {
                if (active && motionInterrupt) motion.stopMove()

                if (!active) {
                    motionSequence[0]()
                    motionSequence.shift()
                }
            }
        })
    }

    function updateAudioOutput(ap, tts) {
        if (audioSequence.length) {
            const speechNotActive = ["stopped", "done"].includes(robot.TextToSpeech.Status)
            const speechActive = robot.TextToSpeech.Status == "started"
            const audioFileActive = robot.AudioPlayer.playing
            if ((speechActive || audioFileActive) && audioInterrupt) {
                ap.stopAll()
                tts.stopAll()

                robot.TextToSpeech.Status = "stopped" // TODO: not sure if necesarry
                robot.AudioPlayer.playing = false
            }

            if (speechNotActive && !audioFileActive) {
                audioSequence[0]()
                audioSequence.shift()
            }
        }
    }

    function updateRobot() {
        session.service("ALMotion").then((motion) => {
            updateYawPitch(motion, 'HeadYaw', state.head.yaw)
            updateYawPitch(motion, 'HeadPitch', state.head.pitch)
            updateHand(motion, 'LHand', state.hand.left)
            updateHand(motion, 'RHand', state.hand.right)
            updateJoint(motion, 'LShoulderPitch', state.shoulder.left.pitch)
            updateJoint(motion, 'LShoulderRoll', state.shoulder.left.roll)
            updateJoint(motion, 'RShoulderPitch', state.shoulder.right.pitch)
            updateJoint(motion, 'RShoulderRoll', state.shoulder.right.roll)
            updateMovement(motion)

            session.service("ALAudioPlayer").then(ap => {
                session.service("ALTextToSpeech").then(tts => {
                    updateAudioOutput(ap, tts)

                    setTimeout(updateRobot, 1000/10) // i.e. x times per second
                }).fail(log_error)
            }).fail(log_error)
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

    let motionSequence = []
    let motionInterrupt = true

    self.stepForwards = function (steps, direction, interrupt = false, callback, destruct = true) {
        const stepLength = 0.025; //in M

        if (interrupt) motionSequence = []
        motionInterrupt = interrupt
        motionSequence.push(() => {
            session.service("ALMotion").then(function(mProxy) {
                mProxy.moveTo(steps * stepLength * direction, 0, 0)
                mProxy.waitUntilMoveIsFinished().done(callback).fail(log_error)
            })
        })
        if (destruct) {
            quando.destructor.add(function () {
                motionSequence = []
                motionInterrupt = true
            })
        }
    }

    self.stepSideways = function (steps, direction, interrupt = false, callback) {
        const stepLength = 0.025; //in M

        if (interrupt) motionSequence = []
        motionInterrupt = interrupt
        motionSequence.push(() => {
            session.service("ALMotion").then(function(mProxy) {
                mProxy.moveTo(0, steps * stepLength * direction, 0)
                mProxy.waitUntilMoveIsFinished().done(callback).fail(log_error)
            })
        })
    }


    self.rotateBody = function (angle, direction, interrupt = false, callback) { //angle in degrees
        angle = helper_ConvertAngleToRads(angle)

        if (interrupt) motionSequence = []
        motionInterrupt = interrupt
        motionSequence.push(() => {
            session.service("ALMotion").then(function(mProxy) {
                mProxy.moveTo(0, 0, angle * direction)
                mProxy.waitUntilMoveIsFinished().done(callback).fail(log_error) 
            })
        })
        if (destruct) {
            quando.destructor.add(function () {
                motionSequence = []
                motionInterrupt = true
            })
        }
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

    self.changeAutonomousLife = (state, callback) => {
        session.service("ALAutonomousLife").then((al) => {
            setTimeout(() => { // setTimeout override set_up behaviour
                al.setState(state).then(() => {
                    if (callback) callback()
                })
            }, 100)
        }).fail(log_error)
    }

    self.createWordList = function (listName) {
        

        var v = new vocabList(listName, [])
        self._list.push(v)
    }

    self.addToWordList = function (listName, vocab) {
        if (!self._list.some(list => list.listName == listName)) self.createWordList(listName)
        
        for (var i = 0; i < self._list.length; i++) {
            if (self._list[i].listName == listName) {
                self._list[i].vocab = self._list[i].vocab.concat(vocab)
            }
        }
    }


    self.listenForWords = function (listName, vocab, confidence, blockID, callback, destruct = true) {
        // waitForSayFinish();
        if (!listName.length) { listName = "default" }

        self.addToWordList(listName, vocab)

        var list;
        var fullList = [];
        for (var i = 0; i < self._list.length; i++) {
            var element = self._list[i];
            self._list[i].vocab.forEach(function (word) {
                if (word.length) {
                    fullList.push(word);
                }
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
                    if (value[1] >= confidence) {
                        if (list.length) {
                            for (var i = 0; i < list.vocab.length; i++) {
                                if (callback && list.vocab[i] == value[0]) {
                                    callback(value[0])
                                }
                            }
                        } else {
                            callback(value[0])
                        }
                    }
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
                    if (state != -1) callback()
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
            quando.destructor.add(function () {
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
            quando.destructor.add(function () {
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

    self.touchFoot = (location, callback) => {
        const suffix = 'BumperPressed'
        if (['Left', 'Right'].includes(location)) {
            _start_touchEvents(session, location + suffix, callback)
        } else if (location == 'Either') {
            _start_touchEvents(session, 'Left' + suffix, callback)
            _start_touchEvents(session, 'Right' + suffix, callback)
        } else return

        quando.destructor.add(() => {
            _destroy_touchEvents()
        })
    }

    setTimeout(updateRobot, 1000) // Start in a second
})()
