(function () {
  ML_URL = "https://eeg-ml.eu-gb.mybluemix.net"

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
      if (this.trained || !this.data.length) return Promise.resolve();
      this.trained = true;

      const endpoint = "/train-model";

      let cols = this.model.ml.cols.slice();
      cols.push("label");
      const msg = { 
        cols,
        data: this.data, 
        new_model: isNewModel,
        model: this.model.model_name
      };

      return fetch(ML_URL + endpoint, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(msg)
      }).then(response => response.text);
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
      this.dataPerPrediction = 10;
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
      const msg = { 
        cols: this.model.ml.cols,
        data: this.data, 
        model: this.model.model_name
      };

      this.setTracking(false);
      this.counter = 0;
      
      return fetch(ML_URL + endpoint, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(msg)
      }).then(response => {
        this.data = [];
        this.setTracking(true);

        return response.text;
      });
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