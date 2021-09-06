class bamPrediction extends bamComponent {
    constructor() {
        super();
        let self = this;
        

        // **********************************************************
        // editable title
        this.title_key = "prediction_title";
        const header = this.dom_header.querySelector(".bam-component-title")
        this.dom_header_generic = document.createElement("span");
        this.dom_header_generic.className = "bam-prediction-title-generic";
        this.dom_header_custom = document.createElement("span");
        this.dom_header_custom.className = "bam-prediction-title-custom";
        header.append(this.dom_header_generic)
        header.append(this.dom_header_custom)

        // **********************************************************
        // tab system

        this.dom_tabs = new bamTabs() 
        this.dom_tabs.setParent(this.dom_content)

        // CONFIGURATION
        this.prediction_config = new bamPredictionConfiguration();
        const prediction_config_tab = this.dom_tabs.newTab();
        // prediction_config_tab.getButton().textContent = "Configuration";
        bamI.set(prediction_config_tab.getButton()).key("prediction_config_tab").text().apply();
        prediction_config_tab.setContent(this.prediction_config.getDOM());
        this.prediction_config.onDeletePredictionCallback = function() {
            self.onDeletePredictionCallback();
        }
        this.prediction_config.onRenamePredictionCallback = function() {
            self.onRenamePredictionCallback();
        }
        this.prediction_config.onRunPredictionCallback = function(config) {
            self.onRunPredictionCallback()
        //     // self.bamMonitor.onBaMpredictionDone = self.onBaMpredictionDone
        }
        this.prediction_config.onChangeCallback = () => {
            // if (isStatusValid(status)) {
            //     self.validated = true;
            // } else {
            //     self.validated = false;
            // }
            this.onChange()
        }
        prediction_config_tab.getButton().click();

        // RESULTS
        this.prediction_files = new bamPredictionResultFiles();
        this.prediction_files_tab = this.dom_tabs.newTab();
        // prediction_files_tab.getButton().textContent = "Result files";
        bamI.set(this.prediction_files_tab.getButton()).key("prediction_result_tab").text().apply();
        this.prediction_files_tab.setContent(this.prediction_files.getDOM());

        // monitoring
        // this.bamMonitor = new bamMonitoring(true);

        // getting the results
        this.n_pred_results_get_attempt = 0
        this.bam_waiting_results = undefined
    }

    // setParent is redefined here to handle the custom component name
    setParent(parent) {
        // set parent:
        parent.append(this.dom_wrapper);
        this.parent = parent;
        // set name:
        bamI.set(this.dom_header_generic).key(this.title_key).text().apply()
    }
    // addExternalNamedItem (defined in bamComponent) is redefined here to handle the custom component name
    addExternalNamedItem(item) {
        const dom_header_generic = document.createElement("span");
        dom_header_generic.className = "bam-prediction-title-generic";
        this.dom_header_custom_external = document.createElement("span");
        this.dom_header_custom_external.className = "bam-prediction-title-custom";
        item.append(dom_header_generic)
        item.append(this.dom_header_custom_external)
        bamI.set(dom_header_generic).key(this.title_key).text().apply()
        this.dom_header_custom_external.textContent = this.dom_header_custom.textContent;
    }
    setPredictionName(name) {
        this.prediction_name = name;
        this.dom_header_custom.textContent = name;
        if (this.dom_header_custom_external) this.dom_header_custom_external.textContent = name;
        this.prediction_config.setPredictionName(name);
        this.setBAMdoneListener() // FIXME: done this way, there might be many unused listeners if users keeps renaming the component...
        this.prediction_files.setPredictionName(name)
    }
    getPredictionName() {
        return this.prediction_name;
    }
    initWaitingMessage() {
        this.bam_waiting_results = new bamMessage({
            message: "please wait while results are getting ready...", // FIXME: internationalization
            auto_destroy: false 
        })
    }
    setBAMdoneListener() {
        // two listeners:
        // > one to say computation is done and I am waiting for the results
        // > one to get the results
        const listener_name = "prediction_results: "+this.prediction_name
        
        const sendNewRequest = (config) => {
            this.n_pred_results_get_attempt++
            if (this.n_pred_results_get_attempt>12) {
                if (this.bam_waiting_results) this.bam_waiting_results.destroy(0)
                new bamMessage({
                    message: "An error occured while trying to retrieve the results files...",
                    type: "error",
                    timeout: 4000,
                })
            }
            setTimeout(() => (
                Shiny.onInputChange("bam_prediction_results", {config: config, r:Math.random()})
            ), 250)
        }
        Shiny.addCustomMessageHandler(listener_name, (data) => {
            console.log(listener_name, data)
            if (!data.results) {
                sendNewRequest(data.config)
            } else {
                // process results files
                const files = []
                for (let key in data.results.inputs) {
                    files.push({
                        name: key,
                        data: data.results.inputs[key], 
                        type: "input"
                    })
                }
                for (let key in data.results.outputs_env) {
                    files.push({
                        name: key,
                        data: data.results.outputs_env[key], 
                        type: "env"
                    })
                }
                for (let key in data.results.outputs_spag) {
                    files.push({
                        name: key,
                        data: data.results.outputs_spag[key], 
                        type: "spag"
                    })
                }
                this.n_pred_results_get_attempt = 0
            
                this.prediction_files.set({
                    inputs: this.inputs, 
                    outputs: this.outputs,
                    files: files
                }, 0)
                this.prediction_files_tab.getButton().click()
                if (this.bam_waiting_results) this.bam_waiting_results.destroy(0)
            }
        })
    }

    onChange() {
        const config = this.get()
        let isValid = this.errorMessageManagement(config.config)
        this.checkConfigOutdating(config.config, (prevConfig) => {
            this.prediction_config.set(prevConfig)
        });
        this.prediction_config.setPredictionValidity(isValid)
    }
    errorMessageManagement(config) {
        this.clearMessages("error");
        let hasError = false;
        let variables_lengths = [];
        for (let v in config.inputs) {
            if (config.inputs[v].mapping.v === "-") {
                this.addThreePartsErrorMessage("run_input", " "+v+": ", "run_data_missing", v+"_run_data_missing");
                hasError = true;
            } 
            // Here, I need to use the original dataset object to use its methods
            // it violates the idea that error management should only rely on the config object... :(
            let v_length = this.prediction_config.datasets.getVariableLength(config.inputs[v].mapping.v);
            if (v_length !== 0) variables_lengths.push(v_length);
        }
        if (Math.min(...variables_lengths) !== Math.max(...variables_lengths) && Math.min(...variables_lengths) !== Infinity) {
            this.addMessage("run_data_lengthissue", "run_data_lengthissue", "error");
            hasError = true;
        }
        if (!this.calibration_valid) {
            this.addMessage("run_calib_invalid", "run_calib_invalid", "error");
            hasError = true
        }
        this.isvalid = !hasError;
        return !hasError;
    }
    setCalibrationValidity(isValid=false) {
        this.calibration_valid = isValid
        this.onChange()
    }
    getValidityStatus() {

    }
    getBaMconfig() {
        const config = this.prediction_config.getBaMconfig();
        config.name = this.prediction_name;
        return config;
    }
    get() {
        const config = {
            config: this.prediction_config.get(),
            results: this.prediction_files.get(),
            name: this.getPredictionName(),
            inputs: this.inputs,
            outputs: this.outputs,
        }
        return config;
    }
    set(config) {
        this.setPredictionName(config.name);
        this.inputs = config.config.inputs
        this.outputs = config.config.outputs
        this.prediction_config.set({
            inputs: config.config.inputs,
            datasets: config.config.datasets,
            pred_type: config.config.pred_type
        });
        this.prediction_files.set(config.results);
        // this.prediction_files.set()
        this.onChange()
        
    }
}