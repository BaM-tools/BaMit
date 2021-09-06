class bamPredictionMaster extends bamComponent {
    constructor() {
        super();

        this.title_key = "prediction_master_title";

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

        this.dom_add_new_prediction.addEventListener("click", () => {
            askForPredictionNameInput((value) => {
                this.addPrediction({name: value, config: {inputs: this.inputs, outputs: this.outputs}});
            },
            Object.keys(this.predictions), "")
        })
        this.predictions = {};
    }

    addPrediction(config) {
        const pred_name = config.name
        let pred
        if (!this.predictions.hasOwnProperty(pred_name)) {
            pred = new bamPrediction();
            // pred.setPredictionName(config.name);
            pred.onDeletePredictionCallback = () => {
                this.onDeletePredictionCallback(pred)
                delete this.predictions[pred.getPredictionName()];
            }
            pred.onRenamePredictionCallback = () => {
                askForPredictionNameInput((new_name) => {
                    delete this.predictions[pred.getPredictionName()];
                    pred.setPredictionName(new_name);
                    this.predictions[new_name] = pred;
                },
                Object.keys(this.predictions), pred.getPredictionName())
            }
            this.predictions[pred_name] = pred;
            this.onAddPredictionCallback(pred);
        }
        this.predictions[pred_name].set(config)
    }

    onChange() {

    }
    getValidityStatus() {

    }
    get() {
        const config = {
            predictions: {},
            inputs: this.inputs,
            outputs:  this.outputs
        };
        for (let p in this.predictions) {
            config.predictions[p] = this.predictions[p].get();
        }
        return config;
    }
    set(config) {
        this.inputs = config.inputs;
        this.outputs = config.outputs;
        if (config.predictions) {
            for (let p in config.predictions) {
                this.addPrediction(config.predictions[p]);
            }
        }
    }
}