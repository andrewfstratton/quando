import * as destructor from "./destructor.js";

const quando = window['quando']
  if (!quando) {
    alert('Fatal Error: eeg must be included after quando_browser');
  }
  const self = quando.eeg = {};

  const client = new Cortex({ verbose: 1 });
  const quandoML = new QuandoML();

  self._labels = [];        // set of labels used for ml classification
  self._subs = [];          // set of Emotiv device data subscriptions

  /*///////////////////////////////////////////////////////////////////////*/
  /* --------------------- Quando Block Functions ------------------------ */
  /*///////////////////////////////////////////////////////////////////////*/

  self.onRotation = (type, mid_angle, plus_minus, inverted, callback) => {
    _requestData("mot").then(() => {
      _handleAngle('eeg' + type, mid_angle, plus_minus, inverted, callback);
    });
  }

  self.onNodding = (type, callback) => {
    _requestData("mot").then(() => {
      quando.add_handler('eegNodding' + type, callback);
    });
  }

  self.onEye = (event, callback) => {
    _requestData("fac").then(() => {
      quando.add_handler('eegEye' + event, callback);
    });
  }

  self.onFaceExpression = (event, min, max, callback) => {
    _requestData("fac").then(() => {
      quando.add_scaled_handler('eegAct' + event, callback, _minMaxScaler(min, max));
    });
  }

  self.onEmotion = (state, min, max, callback) => {
    _requestData("met").then(() => {
      quando.add_scaled_handler('eegMet' + state, callback, _minMaxScaler(min, max));
    });
  }

  self.onCommand = (command, min, max, callback) => {
    _requestData("com").then(() => {
      quando.add_scaled_handler('eegCom' + command, callback, _minMaxScaler(min, max));
    });
  }

  self.onLabel = (label, modelName, isNewModel, callback) => {
    _requestData("pow").then(() => {
      if (!(self._labels.includes(label))) self._labels.push(label);
      const model = quandoML.buildModel(modelName);

      model.training.loadAndRun(isNewModel).then(() => {
        quando.add_handler("eegML" + modelName + "Label" + self._labels.indexOf(label), callback);
        model.classifier.setTracking(true);

        destructor.add(() => {
          self._labels = [];
          model.classifier.counter = 0;
          model.classifier.setTracking(false);
        });
      });
    });
  }

  self.fetchDataForLabel = (label, seconds, modelName) => {
    _requestData("pow").then(() => {
      const model = quandoML.buildModel(modelName);

      model.training.setTrackingLabel(label);
      model.training.setTrackingTimeout(seconds);

      destructor.add(() => {
        model.training.setTracking(false);
      });
    });
  }


  /*///////////////////////////////////////////////////////////////////////*/
  /* ---------------------- Data Request Functions ----------------------- */
  /*///////////////////////////////////////////////////////////////////////*/

  function _requestData(type) {
    return new Promise((resolve) => {
      if (self._subs.includes(type)) return resolve();
      self._subs.push(type);

      client.on("connected", () => {
        return client.subscribe({ streams: [type], session: client.session.id })
          .then(({ success }) => {
            if (!success.length) { throw new Error("failed to subscribe to " + type); }

            const cols = success[0].cols;
            let processData;
            if (_initProcessing[type]) {
              processData = _initProcessing[type](cols);
            } else {
              processData = _initProcessing.default(cols);
            }

            client.on(type, (ev) => {
              const data = processData(ev[type]);
              if (data) self.handlers[type](data);
            });
    
            return resolve();
        });
      })
    });
  }


  /*///////////////////////////////////////////////////////////////////////*/
  /* ---------------------- Data Response Handlers ----------------------- */
  /*///////////////////////////////////////////////////////////////////////*/

  self.handlers = {
    "mot" : function (data) {
      quando.idle_reset();

      if (data.yaw != self.last_yaw) {
        quando.dispatch_event('eegYaw', {'detail': data.yaw});
        self.last_yaw = data.yaw
      }

      if (data.pitch != self.last_pitch) {
        quando.dispatch_event('eegPitch', {'detail': data.pitch});
        self.last_pitch = data.pitch
      }

      if (data.roll != self.last_roll) {
        quando.dispatch_event('eegRoll', {'detail': data.roll});
        self.last_roll = data.roll
      }

      if (data.nodding) {
        quando.dispatch_event('eegNodding' + data.nodding);
        _nodding.reset();
      }
    },
    "fac" : function (data) {
      quando.idle_reset();

      quando.dispatch_event('eegEye' + _capitalize(data.eyeAct));
      quando.dispatch_event('eegAct' + _capitalize(data.uAct), {'detail': data.uPow});
      quando.dispatch_event('eegAct' + _capitalize(data.lAct), {'detail': data.lPow});
    },
    "met" : function (data) {
      quando.idle_reset();

      for (key of Object.keys(data)) {
        quando.dispatch_event('eegMet' + _capitalize(key), {'detail': data[key]});
      }
    },
    "com" : function (data) {
      quando.idle_reset();

      const comEvent = 'eegCom' + _capitalize(data.act);
      quando.dispatch_event(comEvent, {'detail': data.pow});
    },
    "pow" : function (data) {
      quando.idle_reset();

      quandoML.fetchData(data);
      quandoML.predictFromModels((modelName, label) => {
        quando.dispatch_event("eegML" + modelName + "Label" + self._labels.indexOf(label));
      });
    }
  }


  /*///////////////////////////////////////////////////////////////////////*/
  /* ----------------------- EEG Motion Helpers -------------------------- */
  /*///////////////////////////////////////////////////////////////////////*/

  function _calibrateOffset(mot, offset, calibrateNum, calibrated) {
    for (col in mot) {
      offset[col] += mot[col];
    }

    if (calibrated) {
      for (col in mot) {
        offset[col] /= calibrateNum;
      }
    }
  }

  function _initMotData(offset) {
    const gyroBias = 90 / 112000;
    const axisDeviation = -Math.PI / 48;
    let integral = {};
    let lastTime = 0;

    for (col in offset) integral[col] = 0;

    return (data) => {
      const currTime = Date.now();
      const diffTime = Math.max(1, currTime - lastTime);
      _nodding.update(data, offset);

      // calculate change over time of gyro data
      // and convert gyro data into angles
      for (col in data) {
        if (col == "GYROX" || col == "GYROY" || col == "GYROZ") {
          integral[col] |= 0;
          integral[col] += (offset[col] - data[col]) / diffTime;
          data[col] = (gyroBias * integral[col]) % 360;
        }
      }

      // rotate gyro axis to fit human head movements
      data.GYROX = data.GYROX * Math.cos(axisDeviation) + data.GYROY * Math.sin(axisDeviation);
      data.GYROY = data.GYROY * Math.cos(axisDeviation) - data.GYROX * Math.sin(axisDeviation);

      lastTime = currTime;

      return {
        yaw: data.GYROX,
        pitch: data.GYROZ,
        roll: data.GYROY,
        nodding: _nodding.get()
      };
    };
  }


  /*///////////////////////////////////////////////////////////////////////*/
  /* ------------------------------ Utils -------------------------------- */
  /*///////////////////////////////////////////////////////////////////////*/

  const _initProcessing = {
    "mot" : (cols) => {
      const motCalibrateNum = 1000;
      const offset = {};
      for (col of cols) offset[col] = 0;

      const processMotData = _initMotData(offset);
      let motCalibrateCount = 0;
      let calibrated = false;

      return (data) => {
        const mot = {};
        cols.forEach((col, i) => mot[col] = data[i]);

        if (!calibrated) {
          motCalibrateCount++;
          calibrated = motCalibrateNum == motCalibrateCount;

          _calibrateOffset(mot, offset, motCalibrateNum, calibrated);
          return;
        }

        return processMotData(mot);
      };
    },
    "pow" : (cols) => {
      quandoML.setCols(cols);

      return (data) => {
        return data;
      }
    },
    default : (cols) => {
      return (data) => {
        const fac = {};
        cols.forEach((col, i) => fac[col] = data[i]);

        return fac;
      }
    }
  }

  const _nodding = {

    diffLimit: 30,
    swingDataLimit: 15,
    swingsLimit: 3,
    nod: {x: 0, y: 0},
    swings: {x: 0, y: 0},
    swingDir: {x: 0, y: 0},

    update: function (data, offset) {
      if (Math.abs(offset.GYROX - data.GYROX) > Math.abs(offset.GYROY - data.GYROY)) {
        this._update("x", data, offset);
      } else {
        this._update("y", data, offset);
      }
    },
    get: function () {
      if (this._get("x")) return "No";
      if (this._get("y")) return "Yes";

      return null;
    },
    _update: function (dir, data, offset) {
      let diff = (dir == "x") ? offset.GYROX - data.GYROX : offset.GYROY - data.GYROY;
      diff = Math.abs(diff) >= this.diffLimit ? diff : 0;
      this.nod[dir] += Math.sign(diff);

      if (Math.abs(this.nod[dir]) == this.swingDataLimit) {
        const d = (this.nod[dir] < 0) ? -1 : 1;

        if (this.swingDir[dir] != d) {
          this.swings[dir]++;
          this.swingDir[dir] = d;
        } else {
          this.resetSwings(dir);
        }

        this.resetNod(dir);
      }
    },
    _get: function (dir) {
      const nodding = this.swings[dir] >= this.swingsLimit;
      if (nodding) {
        this.reset();
      }

      return nodding;
    },
    reset() {
      for (const type of "xy") {
        this.resetNod(type);
        this.resetSwings(type);
      }
    },
    resetNod(dir) {
      this.nod[dir] = 0;
    },
    resetSwings(dir) {
      this.swings[dir] = 0;
      this.swingDir[dir] = 0;
    }
  }

  function _handleAngle(event, mid_angle, plus_minus, inverted, callback) {
    var scale = quando.new_angle_scaler(mid_angle, plus_minus, inverted)
    quando.add_scaled_handler(event, callback, scale)
  }

  function _capitalize(txt) {
    return txt.replace(/^\w/, c => c.toUpperCase());
  }

  function _minMaxScaler(min, max) {
    return value => (value >= min && value <= max) ? value : null;
  }


  /*///////////////////////////////////////////////////////////////////////*/
  /* ------------------- EEG Headset Initialization ---------------------- */
  /*///////////////////////////////////////////////////////////////////////*/

  client.ready
    .then(() => client.init({
      clientId: "8sfFMP0y2opXq6gmhNBAmcbdnDdBM06y6Y3RiJiL", 
      clientSecret: "cR8MKcueMdKDvYh33zUmnxHYfMqoi9nwD5VuM0lzZt1Z5iBxP7JDovZ0n96dONYvUgDM8mB9IRsw7tjX2o8oS5IehDsLpOrXKKL2HvePWrYwhdWW8Q6W9ynD75uohikw"
    })) 
    .then(() => client.createSession({ status: 'open' }))
    .then((session) => {
      client.session = session;
      client.emit("connected", {}, true);
    });