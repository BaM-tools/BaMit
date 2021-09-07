class bamPredictionConfiguration {
    constructor() {

        // **********************************************************
        // main wrapper
        this.dom_wrapper = document.createElement("div");
        this.dom_wrapper.className = "bam-prediction-configuration";
                
        // **********************************************************
        // actions on prediction
        // > rename, delete, duplicate
        this.dom_pred_actions = document.createElement("div"); // CONST*
        this.dom_pred_actions.className = "pred-actions";
        this.dom_wrapper.append(this.dom_pred_actions);

        const dom_pred_action_rename = document.createElement("button")
        dom_pred_action_rename.className = "bam-btn-simple";
        bamI.set(dom_pred_action_rename).key("prediction_rename_btn").text().apply()
        dom_pred_action_rename.addEventListener("click", () => {
            this.onRenamePredictionCallback()
        })
        this.dom_pred_actions.append(dom_pred_action_rename)

        const dom_pred_action_delete = document.createElement("button")
        dom_pred_action_delete.className = "bam-btn-simple";
        bamI.set(dom_pred_action_delete).key("prediction_delete_btn").text().apply()
        dom_pred_action_delete.addEventListener("click", () => {
            new bamMessage({
                type: "warning",
                message: bamI.getText("pred_ask_delete"),
                question: true,
                yes: function() {
                    if (this.onDeletePredictionCallback) this.onDeletePredictionCallback();
                }
            })
        })  
        this.dom_pred_actions.append(dom_pred_action_delete)

        // **********************************************************
        // dataset section
        this.dom_pred_datasets = document.createElement("div"); // CONST*
        this.dom_pred_datasets.className = "pred-datasets";
        this.dom_wrapper.append(this.dom_pred_datasets);

        // dataset loader/manger
        this.datasets = new bamDatasets(5000000, 1000);
        this.datasets.setParent(this.dom_pred_datasets)
        this.datasets.onDisplayDatasetCallback = (dataset) => {
            let name = this.dom_pred_datasetviewer.querySelector("#name");
            if (name && name.textContent === dataset.name) return;
            this.dom_pred_datasetviewer.innerHTML = "";
            new bamDatasetViewer(dataset, this.dom_pred_datasetviewer)
        }
        this.datasets.onDeleteDatasetCallback = (to_delete_dataset_name) => {
            let name = this.dom_pred_datasetviewer.querySelector("#name");
            if (name && name.textContent === to_delete_dataset_name) {
                this.dom_pred_datasetviewer.innerHTML = "";
            }
        }
        this.datasets.onChangeCallback = (datasets) => {
            const mapping_options = this.datasets.getDatasetsMappingOptions(false);
            for (let input in this.inputs) {
                // this.inputs[input].updateMappingOptions(datasets);
                this.inputs[input].updateMappingOptions(mapping_options);
            }
            this.onChange()
        }

        // dataset viewer
        this.dom_pred_datasetviewer = document.createElement("div"); // CONST*
        this.dom_pred_datasetviewer.className = "pred-dataset-viewer"
        this.dom_pred_datasets.append(this.dom_pred_datasetviewer);

        // **********************************************************
        // input / dataset mapping + prediction configuration
        this.dom_pred_mapping_and_config = document.createElement("div");// TOO SIMPLISITIC CONST*
        this.dom_pred_mapping_and_config.className = "pred-mapping-config";
        this.dom_wrapper.append(this.dom_pred_mapping_and_config);

        // mapping:
        const dom_pred_mapping = document.createElement("div");
        dom_pred_mapping.className = "pred-mapping";
        this.dom_pred_mapping_and_config.append(dom_pred_mapping)

        const dom_pred_mapping_header = document.createElement("div");
        dom_pred_mapping_header.className = "pred-mapping-header";
        dom_pred_mapping_header.textContent = "Map each input variable to a dataset and column:" // FIXME: internationalization
        dom_pred_mapping.append(dom_pred_mapping_header);

        this.dom_pred_mapping_inputs = document.createElement("div");
        this.dom_pred_mapping_inputs.className = "pred-mapping-inputs";
        dom_pred_mapping.append(this.dom_pred_mapping_inputs);

        // prediction type:
        const dom_pred_type = document.createElement("div");
        dom_pred_type.className = "pred-type";
        this.dom_pred_mapping_and_config.append(dom_pred_type);

        const dom_pred_type_header = document.createElement("div");
        dom_pred_type_header.className = "pred-type-header";
        bamI.set(dom_pred_type_header).key("prediction_select_type").text().apply();
        dom_pred_type.append(dom_pred_type_header);

        this.dom_pred_type_select = bamCreateSelect("pred-type-select");
        dom_pred_type.append(this.dom_pred_type_select)
        let opt = this.dom_pred_type_select.addOption();
        bamI.set(opt).key("prediction_type_maxpost").text().apply();
        opt.key = "maxpost";
        opt = this.dom_pred_type_select.addOption();
        bamI.set(opt).key("prediction_type_param").text().apply();
        opt.key = "param";
        opt = this.dom_pred_type_select.addOption();
        bamI.set(opt).key("prediction_type_total").text().apply();
        opt.key = "total";
        // opt = this.dom_pred_type_select.addOption();
        // bamI.set(opt).key("prediction_type_prior").text().apply();
        // opt.key = "prior";
        this.dom_pred_type_select.setSelectedByKey("total");

        // **********************************************************
        // run prediction:
        // run button
        // FIXME manage ready state of component! similarly to the runBaM component I guess
        this.dom_pred_run = document.createElement("div");
        this.dom_pred_run.className = "pred-run";
        this.dom_wrapper.append(this.dom_pred_run);

        this.dom_pred_run_launch = document.createElement("button");
        bamI.set(this.dom_pred_run_launch).key("prediction_run_btn").text().apply();
        this.dom_pred_run_launch.addEventListener("click", () => {
            this.onRunPredictionCallback(this.getBaMconfig());
        });
        this.dom_pred_run.append(this.dom_pred_run_launch);

        // **********************************************************
        // main property
        this.inputs = {};
    }

    getDOM() {
        return this.dom_wrapper;
    }

    setPredictionName(name) {
        this.prediciton_name = name;
    }

    onChange() {
        this.onChangeCallback()
    }
    setPredictionValidity(isValid=false) {
        if (isValid) {
            this.dom_pred_run_launch.disabled = false;
        } else {
            this.dom_pred_run_launch.disabled = true;
        }
    }
    getBaMconfig() {
        const inputs = {};
        for (let v in this.inputs) {
            let mapping_codes = this.inputs[v].getMapping();
            inputs[v]= this.datasets.getVariable(mapping_codes.v)
        }
        const pred_type = this.dom_pred_type_select.getSelected().key;
        return {inputs: inputs, pred_type: pred_type};
    }

    get() {
        // get returns mapping for each input, the datasets, and the type of prediction
        const datasets = this.datasets.get();
        const inputs = {};
        for (let v in this.inputs) {
            inputs[v] = this.inputs[v].get();
        }
        const pred_type = this.dom_pred_type_select.getSelected().key;
        const out = {
            datasets: datasets,
            inputs: inputs, 
            pred_type: pred_type
        };
        return out;
    }
    set(config) {
        this.datasets.set(config.datasets) // can be undefined...
        const mapping_options = this.datasets.getDatasetsMappingOptions(false);
        // set inputs
        for (let v in config.inputs) {
            if (!this.inputs[v]) {
                this.inputs[v] = new bamVariable(false, false);
                this.inputs[v].setParent(this.dom_pred_mapping_inputs);
                this.inputs[v].onChangeCallback = () => {
                    this.onChange();
                }
            }
            // FIXME: this is weird... But I don't find any cleaner solution when a new/updated variable is
            // added and do not has its mapping options ...
            if (!config.inputs[v].mapping_options) {
                config.inputs[v].mapping_options = mapping_options;
            }
            this.inputs[v].set(config.inputs[v])
        }
        for (let v in this.inputs) {
            if (!config.inputs[v]) {
                this.inputs[v].delete();
                delete this.inputs[v];
            }
        }
        if (config.pred_type) {
            this.dom_pred_type_select.setSelectedByKey(config.pred_type);
        }
    }
}