(function () {
  ML_URL = "http://127.0.0.1:5000"

  class Training {
    constructor(model, options = {}) {
      this.model = model;
      this.options = options;
      this.cols = [];
      this.data = [];
      this.label = -1;
      this.tracking = false;
      this.trained = false;
    }
    setTrackingLabel(label) {
      this.label = label;
    }
    setTracking(val) {
      if (val == true) this.trained = false;
      this.tracking = val;
    }
    isTracking() {
      return !!this.tracking;
    }
    setTrackingTimeout(seconds) {
      this.setTracking(true);
      setTimeout(() => {
        this.setTracking(false);
      }, seconds * 1000);
    }
    addData(data) {
      data.push(this.label);
      this.data.push(data);
    }
    loadAndRun(isNewModel) {
      if (this.trained) return Promise.resolve();
      this.trained = true;

      const endpoint = "/train-model";

      let cols = this.model.ml.cols.slice();
      cols.push("label");
      const msg = JSON.stringify({ 
        cols,
        data: this.data, 
        new_model: isNewModel,
        model: this.model.model_name
      });
      // const msg = JSON.stringify({ csv: this._buildCSV() });

      const xhttp = new XMLHttpRequest();
      xhttp.open("POST", ML_URL + endpoint);
      xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
      xhttp.setRequestHeader("Content-Type", "application/json");
      xhttp.send(msg);

      return new Promise((resolve, reject) => {
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4) {
            if (this.status == 200) {
              return resolve(this.responseText);
            } else {
              this.trained = false;
              return reject(this.response.error);
            }
          }
        };
      })
    }
    _buildCSV() {
      let cols = this.model.ml.cols.slice();
      cols.push("label");

      return Papa.unparse({ "fields": cols, "data": this.data }, { newline: "\n" });
    }
  }

  class Classifier {
    constructor(model, options = {}) {
      this.model = model;
      this.options = options;
      this.data = [];
      this.cols = [];
      this.tracking = false;
      this.counter = 0;
      this.dataPerPrediction = 20;
    }
    setTracking(val) {
      this.tracking = val;
    }
    isTracking() {
      return !!this.tracking;
    }
    addData(data) {
      this.data.push(data);
      this.counter++;
    }
    readyForPrediction() {
      return this.counter == this.dataPerPrediction;
    }
    predict() {
      const endpoint = "/predict-from-model";
      const msg = JSON.stringify({ 
        cols: this.model.ml.cols,
        data: this.data, 
        model: this.model.model_name
      });

      const xhttp = new XMLHttpRequest();
      xhttp.open("POST", ML_URL + endpoint);
      xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
      xhttp.setRequestHeader("Content-Type", "application/json");
      xhttp.send(msg);

      this.setTracking(false);
      self.counter = 0;
      
      self = this;
      return new Promise(resolve => {
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            resolve(this.responseText);
            self.data = [];
            self.setTracking(true);
          }
        };
      })
    }
    _buildCSV() {
      return Papa.unparse({ "fields": this.model.ml.cols, "data": this.data }, { newline: "\n" });
    }
  }

  class Model {
    constructor(model_name, ml) {
      this.model_name = model_name;
      this.ml = ml;
      this.training = new Training(this);
      this.classifier = new Classifier(this);
    }
  }

  class QuandoML {
    constructor(options = {}) {
      this.options = options;
      this.cols = [];
      this.models = [];
    }
    buildModel(model) {
      if (!(model in this.models)) this.models[model] = new Model(model, this);
      return this.models[model];
    }
    setCols(cols) {
      this.cols = cols;
    }
    fetchData(data) {
      for (const model of Object.values(this.models)) {
        if (model.training.isTracking()) model.training.addData(data);
        if (model.classifier.isTracking()) model.classifier.addData(data);
      }
    }
    predictFromModels(callback) {
      for (const model_name of Object.keys(this.models)) {
        if (this.models[model_name].classifier.readyForPrediction()) {
          this.models[model_name].classifier.predict().then(labelId => callback(model_name, labelId));
        }
      }
    }
    addLabel(label) {
      if (!this.labels.includes(label)) this.labels.push(label);
    }
  }

  this["QuandoML"] = QuandoML;
})();