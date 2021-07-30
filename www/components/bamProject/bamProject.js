/**
 * @description
 * BaM project class. It manages :
 * (1) all the interactions between the BaM project components: model specification, 
 *     calibration data, prior parameter distribution, run BaM, BaM results, etc.
 * (2) it also manages the export, reset, delete and rename of the project.
 * It contains a 'sticky' header DOM section with export, reset, delete and rename actions/buttons
 * as well as a content DOM section where the project components are visible and that the user
 * can scroll
 * 
 * @author Ivan Horner
 */
class bamProject {

    constructor() {

        this.dom_wrapper = document.createElement("div");
        this.dom_wrapper.className = "bam-project";

        this.bam_projectUI = new bamProjectUI();
        this.bam_projectUI.setParent(this.dom_wrapper);

        let self = this;
        this.bam_projectUI.onSaveCallback = function() {
            let config = self.get(); //FIXME
            if (config.xtra !== undefined) {
                const a = document.createElement("a");
                a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(config)));
                a.setAttribute('download', config.name + ".bam");
                a.click();
            }
        }
        this.bam_projectUI.onResetCallback = function() {
            new bamMessage({
                message: bamI.getText("warning_reset_project"),
                type: "warning",
                question: true,
                yes: function() {
                    self.reset();
                    self.set({name: self.name, modelid: self.modelid});
                }
            })
        }
        this.bam_projectUI.onDeleteCallback = function() {
            new bamMessage({
                message: bamI.getText("warning_delete_project"),
                type: "warning",
                question: true,
                yes: function() {
                    self.onDeleteCallback();
                }
            })
        }
        this.bam_projectUI.onRenameCallback = function(name) {
            self.name = name;
        }

        this.reset();
    }

    reset() {
        // should I removed the components from the DOM as well?
        this.bam_xtra = null;
        this.bam_priors = null;
        this.bam_data = null;
        this.bam_remnant = null;
        this.bam_runcalib = null;
        this.bam_results = null;
        this.bam_predictions = null;
        this.bam_projectUI.clearComponents();
    }

    getDOM() {
        return this.dom_wrapper;
    }

    // XTRA SECTION CONFIGURATION
    setXtraSection(config) {
        let self = this;
        if (this.modelid === "TextFile") {
            this.bam_xtra = new bamXtraTextFile();
            this.bam_projectUI.addComponent(this.bam_xtra);
        } else {
            throw "MODEL NOT IMPLEMENTED";
        }
        if (config.xtra) {
            this.bam_xtra.set(config.xtra);
            if (config.validated) {
                this.bam_xtra.setConfig(config.validated.xtra); // FIXME: I should have the saved config instead!
            }
        }
        this.bam_xtra.onValidationCallback = function(config_xtra) {
            const config = {};
            config.xtra = config_xtra;
            // create and/or setup component according to the configuration of the model
            self.setCalibrationSection(config);
        }
    }
    // CALIBRATION SECTION CONFIGURATION
    setCalibrationSection(config) {
        if (!this.bam_priors) {
            this.bam_priors = new bamPriors();
            this.bam_projectUI.addComponent(this.bam_priors);
        }
        if (!this.bam_data) {
            this.bam_data = new bamCalibrationData();
            this.bam_projectUI.addComponent(this.bam_data);
        } 
        if (!this.bam_remnant) {
            this.bam_remnant = new bamRemnantErrorModel();
            this.bam_projectUI.addComponent(this.bam_remnant);
        }
        if (!this.bam_runcalib) {
            this.bam_runcalib = new bamRun();
            this.bam_projectUI.addComponent(this.bam_runcalib);
            // if any change occurs in one of the updstream component
            // check the validity to enable/disable run model button
            let self = this;
            let onChangeCallback = function() {
                self.bam_runcalib.setCalibrationValidity(
                    self.bam_data.isvalid && self.bam_priors.isvalid && self.bam_remnant.isvalid
                )
            }
            this.bam_data.onChangeCallback = onChangeCallback
            this.bam_priors.onChangeCallback = onChangeCallback
            this.bam_remnant.onChangeCallback = onChangeCallback
            
            // define what happen when BaM calibration is run
            // with the callback when BaM calibration is done.
            this.bam_runcalib.onRunBamCallback = function() {
                const BaM_config = {};
                BaM_config.xtra             = self.bam_xtra.getBaMconfig();
                BaM_config.parameters       = self.bam_priors.getBaMconfig();
                BaM_config.calibration_data = self.bam_data.getBaMconfig();
                BaM_config.remnant_errors   = self.bam_remnant.getBaMconfig();
                BaM_config.project          = {doCalib: true, doPred: false}
                BaM_config.r = Math.random()
                // Shiny.setInputValue("run_calibration", BaM_config); 
                Shiny.onInputChange("run_calibration", BaM_config); 
                // this sets the default component state (I case it gets outdated)
                self.bam_priors.setConfig();
                self.bam_data.setConfig();   
                self.bam_remnant.setConfig();
            }

            Shiny.addCustomMessageHandler("calibration_results", function(data) {
                const names = {
                    parameters: config.xtra.parameters,
                    inputs:     config.xtra.inputs,
                    outputs:    config.xtra.outputs,
                    // remnant:    self.bam_remnant.get()
                }
                if (!config.calib_res) {
                    config.calib_res = {data: data, names: names}
                } else {
                    config.calib_res.data = data;
                    // config.calib_res.names = names;
                }
                self.setAfterCalibrationSection(config)
            })
        }
        if (config.priors && config.data && config.remnant) {
            this.bam_priors.set(config.priors);
            this.bam_data.set(config.data);
            this.bam_remnant.set(config.remnant);
            if (config.validated) {
                this.bam_priors.setConfig(config.validated.priors);    // FIXME: I should have the saved config instead!
                this.bam_data.setConfig(config.validated.data);        // FIXME: I should have the saved config instead!
                this.bam_remnant.setConfig(config.validated.remnant);  // FIXME: I should have the saved config instead!
                
                // FIXME: I should do this if and only if the model has been calibrated and I actually have
                // a result component
                // this.bam_priors.setConfig()
                // this.bam_data.setConfig()
                // this.bam_remnant.setConfig()
            }
        } else {
            this.bam_priors.set(config.xtra.parameters);
            this.bam_data.set({inputs: config.xtra.inputs, outputs: config.xtra.outputs});
            this.bam_remnant.set(config.xtra.outputs);
        }
    }
    // AFTER CALIBRATION SECTION CONFIGURATION
    setAfterCalibrationSection(config) {
        consqol
        let self = this;
        if (!this.bam_results) {
            this.bam_results = new bamResults();
            this.bam_projectUI.addComponent(this.bam_results);
        }
        if (config.calib_res) {
            this.bam_results.set(config.calib_res);
        } else {
            // only set from xtra component
            this.bam_results.set({parameters: config.xtra.parameters, outputs: config.xtra.inputs});
        }
        // this.bam_results.set(config.calib_res);
        if (!this.bam_predictions) {
            this.bam_predictions = new bamPredictionMaster();
            this.bam_projectUI.addComponent(this.bam_predictions);
            this.bam_predictions.onAddPredictionCallback = function(prediction) {
                self.bam_projectUI.addComponent(prediction);
                prediction.onRunPredictionCallback = function() {
                    const config = self.getBaMconfig();
                    config.prediction = prediction.getBaMconfig();
                    config.project = {doCalib: false, doPred: true}
                    // Shiny.setInputValue("run_prediction", config); 
                    Shiny.onInputChange("run_prediction", config); 
                    prediction.setConfig();
                }
                self.bam_projectUI.scrollToComponent(prediction);
            }
            this.bam_predictions.onDeletePredictionCallback = function(prediction) {
                self.bam_projectUI.deleteComponent(prediction);
            }
        }
        if (config.predictions) {
            this.bam_predictions.set(config.predictions);
        } else {
            // only set from xtra component
            this.bam_predictions.set({inputs: config.xtra.inputs});
        }
        this.bam_projectUI.scrollToEnd();
    }

    setModelName(name) {
        this.name = name;
        PROJECT_NAME = name
        this.bam_projectUI.setModelName(name)
    }
    setModelType(modelid) {
        this.modelid = modelid;
        this.bam_projectUI.setModelType(modelid)
    }
    getBaMconfig() {
        const config = {};
        config.xtra = this.bam_xtra.getBaMconfig();
        if (this.bam_priors) config.parameters = this.bam_priors.getBaMconfig();
        if (this.bam_data) config.calibration_data = this.bam_data.getBaMconfig();
        if (this.bam_remnant) config.remnant_errors = this.bam_remnant.getBaMconfig();
        // if (this.bam_runcalib) config.run_options = this.bam_runcalib.getBaMconfig(); // MCMC options
        if (this.bam_results) config.mcmc = this.bam_results.getBaMconfig(); // the MCMC results needed for prediction
        return config;
    }
    get() {
        const config = {
            version: 0.4,
            name: this.name,
            modelid: this.modelid,
            xtra: null,
            priors: null,
            data: null,
            remnant: null,
            calib_run: null,
            calib_res: null,
            predictions: null,
            validated: {}
        }
        config.xtra = this.bam_xtra.get();
        config.validated.xtra = this.bam_xtra.getUptodateConfig(config.xtra);
        if (this.bam_priors) {
            config.priors = this.bam_priors.get();
            // config.validated.priors = this.bam_priors.hasConfig();
            config.validated.priors = this.bam_priors.getUptodateConfig(config.priors);
        }
        if (this.bam_data) {
            config.data = this.bam_data.get();
            // config.validated.data = this.bam_data.hasConfig();
            config.validated.data = this.bam_data.getUptodateConfig(config.data);
        }
        if (this.bam_remnant) {
            config.remnant = this.bam_remnant.get();
            // config.validated.remnant = this.bam_remnant.hasConfig();
            config.validated.remnant = this.bam_remnant.getUptodateConfig(config.remnant);
        }
        // if (this.bam_runcalib) {
        //     config.calib_run = this.bam_runcalib.get();
        // }
        if (this.bam_results) {
            config.calib_res = this.bam_results.get();
        }
        if (this.bam_predictions) {
            config.predictions = this.bam_predictions.get();
        }
        return config
    }

    set(config) {
        this.setModelName(config.name)
        this.setModelType(config.modelid)
        this.setXtraSection(config);
        if (config.priors && config.data && config.remnant) {
            this.setCalibrationSection(config);
        }
        if (config.calib_res) {
            this.setAfterCalibrationSection(config);
        }
    }
  
}