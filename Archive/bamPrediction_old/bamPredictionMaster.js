class bamPredictionMaster extends bamComponent {
    constructor() {
        super();

        this.title_key = "prediction_master_title";

        this.dom_predictionmaster = document.createElement("div")
        this.dom_predictionmaster.className = "bam-prediction-master";
        this.dom_content.append(this.dom_predictionmaster);

        this.dom_tab_buttons = document.createElement("div");
        this.dom_tab_buttons.className = "tab-buttons"
        this.dom_predictionmaster.append(this.dom_tab_buttons)
        this.dom_tab_content = document.createElement("div");
        this.dom_tab_content.className = "tab-content"
        this.dom_predictionmaster.append(this.dom_tab_content)

        this.dom_add_prediction = document.createElement("button")
        this.dom_add_prediction.className = "tab-button-add"
        // this.dom_add_prediction.textContent = "+ add a prediction"
        bamI.set(this.dom_add_prediction).key("prediction_add").text().apply();
        this.dom_tab_buttons.append(this.dom_add_prediction)
        let self = this;
        this.dom_add_prediction.addEventListener("click", function() {
            self.addPrediction();
        })

        this.predictions = {};
        this.inputs = [];
        this.noPredictionTab();
    }
    addPrediction() {
        let self = this;
        // if it exist, save the current prediction (opened tab)
        // in case the user cancels the new prediction creation
        let current_pred = self.dom_tab_content.children;
        if (current_pred.length > 0) {
            current_pred = current_pred[0] 
        } else {
            current_pred = null;
        }

        // create the temporary message asking for the prediction name
        const pred_name_wrapper = document.createElement("div");
        pred_name_wrapper.className = "ask-pred-name-wrapper";
        const pred_name_input_wrapper = document.createElement("div");
        pred_name_input_wrapper.className = "input-wrapper";
        pred_name_wrapper.append(pred_name_input_wrapper);

        const pred_name_input = document.createElement("input");
        bamI.set(pred_name_input).key("prediction_name").attr("placeholder").apply()
        pred_name_input.onkeypress = function(e) {
            if (e.keyCode == 13) pred_name_validate.click();
        }
        pred_name_input_wrapper.append(pred_name_input);

        const pred_name_validate = document.createElement("button");
        bamI.set(pred_name_validate).key("ok").text().apply();
        pred_name_input_wrapper.append(pred_name_validate);

        const pred_name_cancel = document.createElement("button");
        bamI.set(pred_name_cancel).key("cancel").text().apply();
        pred_name_cancel.addEventListener("click", function() {
            pred_name_wrapper.remove();
            if (current_pred) self.dom_tab_content.append(current_pred);
        })
        pred_name_input_wrapper.append(pred_name_cancel);

        const pred_name_message = document.createElement("div");
        pred_name_message.className = "input-message"
        pred_name_wrapper.append(pred_name_message);

        // main action when OK is clicked where the new prediction is 
        // created
        pred_name_validate.addEventListener("click", function() {
            // first, check the validity of the name
            function validation_function(value) {
                if (value.length > 30) {
                    return "Maximum number of character is 30.";
                } else if (value.length <= 0) {
                    return "Minimum number of character is 1.";
                } else if (/[~`!#$%\^&*+=\-\[\]\\'();,/{}|\\":<>\?]/g.test(value)) {
                    return "Forbidden special character (~`!#$%^&*+=\\-[]'();,/{}|\":<>?)";
                } else if (Object.keys(self.predictions).indexOf(value) !== -1) {
                    return "Prediction name already used!";
                }
                return false;
            }
            const prediction_name = pred_name_input.value;
            const error_msg = validation_function(prediction_name);
            if (error_msg) {
                pred_name_message.textContent = error_msg;
            } else {
                // if preduction name is valid, create the new prediction
                const pred = new bamPrediction(prediction_name);
                pred.update(self.inputs);
                pred.onDeletePredictionCallback = function() {
                    // when the delete prediction button is clicked.
                    // look for the other prediction(s) (if any) and open 
                    // the last one
                    pred_btn.remove();
                    delete self.predictions[prediction_name];
                    self.dom_tab_content.innerHTML = "";
                    self.noPredictionTab();
                    const available_pred = Object.keys(self.predictions);
                    if (available_pred.length>0) {
                        self.predictions[available_pred[available_pred.length-1]].prediction_tab_btn.click();
                        self.predictions[available_pred[available_pred.length-1]].prediction_tab_btn.focus();
                    }
                }
                // also create the tab button of this new prediction to add to the prediction master tabs
                const pred_btn = document.createElement("button");
                pred_btn.className = "tab-button";
                pred_btn.textContent = prediction_name;
                pred_btn.addEventListener("click", function() {
                    if (!this.hasAttribute("opened")) {
                        for (let pb of self.dom_tab_buttons.querySelectorAll("button")) {
                            pb.removeAttribute("opened");
                        }
                        this.setAttribute("opened", "");
                        self.dom_tab_content.innerHTML = "";
                        self.dom_tab_content.append(pred.getDOM())
                    }
                })
                self.dom_add_prediction.insertAdjacentElement("beforebegin", pred_btn);
                // attaching button to instance of prediction: ugly but working
                pred.prediction_tab_btn = pred_btn; 
                self.predictions[prediction_name] = pred;
                pred_btn.click();
            }
        })

        this.dom_tab_content.innerHTML = "";
        this.dom_tab_content.append(pred_name_wrapper)
        pred_name_input.focus();
    }

    noPredictionTab() {
        this.dom_tab_content.innerHTML = "";
        const dom_no_pred = document.createElement("div")
        dom_no_pred.className = "pred-no-pred"
        // dom_no_pred.textContent = "No predictions."
        bamI.set(dom_no_pred).key("prediction_none").text().apply()
        this.dom_tab_content.append(dom_no_pred)
    }

    update(inputs) {
        this.inputs = inputs;
        for (let pred in this.predictions) {
            this.predictions[pred].update(inputs);
        }
    }
    onChange() {

    }
    getValidityStatus() {

    }
    get() {
        return {};
    }
    set(config) {

    }
}