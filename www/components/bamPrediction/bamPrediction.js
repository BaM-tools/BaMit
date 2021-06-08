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
            // config.name = self.prediction_name;
            // console.log("this.prediction_config.onRunPredictionCallback:")
            // console.log(config)
            // Shiny.setInputValue("run_prediction", config);
            // self.launch(config);
        }
        this.prediction_config.onChangeCallback = function(status) {
            if (isStatusValid(status)) {
                self.validated = true;
            } else {
                self.validated = false;
            }
        }
        prediction_config_tab.getButton().click();

        this.prediction_files = new bamPredictionResultFiles();
        const prediction_files_tab = this.dom_tabs.newTab();
        // prediction_files_tab.getButton().textContent = "Result files";
        bamI.set(prediction_files_tab.getButton()).key("prediction_result_tab").text().apply();
        prediction_files_tab.setContent(this.prediction_files.getDOM());

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
        // console.log(this.dom_header_custom.textContent);
        this.dom_header_custom.textContent = name;
        if (this.dom_header_custom_external) this.dom_header_custom_external.textContent = name;
        this.prediction_config.setPredictionName(name);
    }
    getPredictionName() {
        return this.prediction_name;
    }
    // launch(config) {
    //     console.log(config);
    //     config.name = this.prediction_name;
    //     Shiny.setInputValue("run_prediction", config);
    // }
    update(inputs) {
        console.log(inputs);
        this.prediction_config.update(inputs);
        // this.tabs.config.update(inputs);
    }
    onChange() {

    }
    getValidityStatus() {

    }
    getBaMconfig() {
        const config = this.prediction_config.getBaMconfig();
        config.name = this.prediction_name;
        return config;
    }
    get() {
        const config = this.prediction_config.get();
        config.name = this.getPredictionName();
        return config;
    }
    set(config) {
        this.setPredictionName(config.name);
        this.prediction_config.set(config);
    }
}