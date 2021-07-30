class bamPredictionMaster extends bamComponent {
    constructor() {
        super();

        this.title_key = "prediction_master_title";
        let self = this;

        this.dom_predictionmaster = document.createElement("div")
        this.dom_predictionmaster.className = "bam-prediction-master";
        this.dom_content.append(this.dom_predictionmaster);

        this.dom_prediction_list = document.createElement("div");
        this.dom_prediction_list.className = "prediction-list";
        this.dom_predictionmaster.append(this.dom_prediction_list)

        this.dom_add_new_prediction = document.createElement('button')
        bamI.set(this.dom_add_new_prediction).key("prediction_master_addpred").text().apply();
        // this.dom_add_new_prediction.textContent = "Add a new prediction";
        this.dom_predictionmaster.append(this.dom_add_new_prediction)

        this.dom_add_new_prediction.addEventListener("click", function() {
            askForPredictionNameInput(function(value) {
                self.addPrediction({name: value, inputs: self.inputs});
            },
            Object.keys(self.predictions), "")
        })
        this.predictions = {};
    }

    addPrediction(config) {
        let self = this;
        const pred = new bamPrediction();
        // pred.setPredictionName(config.name);
        pred.onDeletePredictionCallback = function() {
            self.onDeletePredictionCallback(pred)
            delete self.predictions[pred.getPredictionName()];
        }
        pred.onRenamePredictionCallback = function() {
            askForPredictionNameInput(function(new_name) {
                delete self.predictions[pred.getPredictionName()];
                pred.setPredictionName(new_name);
                self.predictions[pred.getPredictionName()] = pred;
            },
            Object.keys(self.predictions), pred.getPredictionName())
        }

        pred.set(config);
        this.onAddPredictionCallback(pred);
        this.predictions[pred.getPredictionName()] = pred;
    }

    onChange() {

    }
    getValidityStatus() {

    }
    get() {
        const config = {predictions: {}};
        config.inputs = this.inputs;
        for (let p in this.predictions) {
            config.predictions[p] = this.predictions[p].get();
        }
        return config;
    }
    set(config) {
        this.inputs = config.inputs;
        if (config.predictions) {
            for (let p in config.predictions) {
                this.addPrediction(config.predictions[p]);
            }
        }
    }
}