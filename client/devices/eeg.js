(function () {
  const quando = this['quando'];
  if (!quando) {
    alert('Fatal Error: eeg must be included after quando_browser');
  }
  const self = quando.eeg = {};

  const verbose = 2;
  const client = new Cortex({verbose});
  const quandoML = new QuandoML();


  /*///////////////////////////////////////////////////////////////////////*/
  /* ---------------------- Quando Box Functions ------------------------- */
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

  self.onUAct = (event, min, callback) => {
    _requestData("fac").then(() => {
      quando.add_scaled_handler('eegUAct' + event, callback, _minScaler(min));
    });
  }

  self.onLAct = (event, min, callback) => {
    _requestData("fac").then(() => {
      quando.add_scaled_handler('eegLAct' + event, callback, _minScaler(min));
    });
  }

  self.onEmotion = (state, min, callback) => {
    _requestData("met").then(() => {
      quando.add_scaled_handler('eegMet' + state, callback, _minScaler(min));
    });
  }

  self.onCommand = (command, min, callback) => {
    _requestData("com").then(() => {
      quando.add_scaled_handler('eegCom' + command, callback, _minScaler(min));
    });
  }

  self.onLabel = (labelId, model_name, isNewModel, callback) => {
    _requestData("pow").then(() => {
      const model = quandoML.buildModel(model_name);

      model.training.loadAndRun(isNewModel).then(accuracy => {
        quando.add_handler("eegML" + model_name + "Label" + labelId, callback);
        model.classifier.setTracking(true);

        quando.destructor.add(() => {
          model.classifier.setTracking(false);
        });
      });
    });
  }

  self.fetchDataForLabel = (labelId, seconds, model_name) => {
    _requestData("pow").then(() => {
      const model = quandoML.buildModel(model_name);
      model.training.setTrackingLabel(labelId);
      model.training.setTrackingTimeout(seconds);

      quando.destructor.add(() => {
        model.training.setTracking(false);
      });
    });
  }


  /*///////////////////////////////////////////////////////////////////////*/
  /* ---------------------- Data Request Functions ----------------------- */
  /*///////////////////////////////////////////////////////////////////////*/

  const subscriptions = [];

  function _requestData(type) {
    return new Promise((resolve) => {
      if (subscriptions.includes(type)) return resolve();
      subscriptions.push(type);

      client.on("connected", () => {
        return client.subscribe({ streams: [type] })
          .then(_subs => {
            const subs = Object.assign({}, ..._subs);
            if (!subs[type])
              throw new Error("failed to subscribe to " + type);              
            
            const cols = subs[type].cols;
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
      }
    },
    "fac" : function (data) {
      quando.idle_reset();

      quando.dispatch_event('eegEye' + _capitalize(data.eyeAct));
      quando.dispatch_event('eegUAct' + _capitalize(data.uAct), {'detail': data.uPow});
      quando.dispatch_event('eegLAct' + _capitalize(data.lAct), {'detail': data.lPow});
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
      quandoML.predictFromModels((model_name, labelId) => {
        quando.dispatch_event("eegML" + model_name + "Label" + labelId);
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
        pitch: data.GYROY,
        roll: data.GYROZ,
        nodding: _nodding.get()
      };
    };
  }


  /*///////////////////////////////////////////////////////////////////////*/
  /* ------------------------------ Utils -------------------------------- */
  /*///////////////////////////////////////////////////////////////////////*/

  const _initProcessing = {
    "mot" : (cols) => {
      // Motion data columns look like 'IMD_GYROX',
      // this will make them look like 'gyroX'
      const makeFriendlyCol = col =>
      col.replace(
        /^IMD_(.*?)([XYZ]?)$/,
        (_, name, dim) => name.toLowerCase() + dim
      );
      
      const motCols = cols.map(makeFriendlyCol);
      const motCalibrateNum = 1000;
      const offset = {};
      for (col of motCols) offset[col] = 0;

      const processMotData = _initMotData(offset);
      let motCalibrateCount = 0;
      let calibrated = false;

      return (data) => {
        const mot = {};
        motCols.forEach((col, i) => mot[col] = data[i]);

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

    diffNod: 5,
    swingDataLimit: 50,
    swingsLimit: 3,
    nod: {x: 0, y: 0},
    maxNod: {x: 0, y: 0},
    swings: {x: 0, y: 0},
    swingDir: {x: 0, y: 0},

    update: function (data, offset) {
      this._update("x", data, offset);
      this._update("y", data, offset);
    },
    get: function () {
      if (this._get("x")) return "Yes";
      if (this._get("y")) return "No";

      return null;
    },
    _update: function (dir, data, offset) {
      const diff = (dir == "y") ? offset.GYROX - data.GYROX : offset.GYROY - data.GYROY;
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
      this.maxNod[dir] = 0;
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

  function _minScaler(min) {
    return (value) => value >= min ? value : null;
  }


  /*///////////////////////////////////////////////////////////////////////*/
  /* ------------------- EEG Headset Initialization ---------------------- */
  /*///////////////////////////////////////////////////////////////////////*/

  client.ready
    .then(() => client.init({username: 'directk'}))
    .then(() => client.createSession({ status: 'open' }))
    .then(() => client.emit("connected", {}, true));

})();