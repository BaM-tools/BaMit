class bamPrediction {
    constructor(name) {

        this.name = name;

        this.dom_wrapper = document.createElement("div");
        this.dom_wrapper.className = "bam-prediction";
        let self = this;

        // configuration of prediction:
        // set name, delete, ignore, doPost or doPrior
        // doPrediction, doStructural
        this.dom_pred_config = document.createElement("div");
        this.dom_pred_config.className = "pred-config";
        
        const dom_pred_delete_btn = document.createElement("button")
        // dom_pred_delete_btn.textContent = "Delete prediction"
        bamI.set(dom_pred_delete_btn).key("prediction_delete_btn").text().apply()
        this.dom_pred_config.append(dom_pred_delete_btn);
        dom_pred_delete_btn.addEventListener("click", function() {
            new bamMessage({
                type: "warning",
                message: bamI.getText("pred_ask_delete"),
                question: true,
                yes: function() {
                    self.onDeletePredictionCallback();
                }
            })
        })

        // dataset section
        this.dom_pred_datasets = document.createElement("div");
        this.dom_pred_datasets.className = "pred-datasets";

        // dataset loader/manger
        this.dom_pred_datasets_manager = new bamDatasets();
        this.dom_pred_datasets_manager.setParent(this.dom_pred_datasets)
        this.dom_pred_datasets_manager.onDisplayDatasetCallback = function(dataset) {
            let name = self.dom_pred_dataset_viewer.querySelector("#name");
            if (name && name.textContent === dataset.name) return;
            self.dom_pred_dataset_viewer.innerHTML = "";
            new bamDatasetViewer(dataset, self.dom_pred_dataset_viewer)
        }
        this.dom_pred_datasets_manager.onChangeCallback = function(datasets) {
            for (let input in self.inputs) {
                self.inputs[input].updateMappingOptions(datasets);
            }
        }

        // dataset viewer
        this.dom_pred_dataset_viewer = document.createElement("div");
        this.dom_pred_dataset_viewer.className = "pred-dataset-viewer"
        this.dom_pred_datasets.append(this.dom_pred_dataset_viewer);

        // input / dataset mapping
        this.dom_pred_mapping = document.createElement("div");
        this.dom_pred_mapping.className = "pred-mapping";

        // set parents
        this.dom_wrapper.append(this.dom_pred_config)
        this.dom_wrapper.append(this.dom_pred_datasets)
        this.dom_wrapper.append(this.dom_pred_mapping)

        // main property
        this.inputs = {};
    }
    getDOM() {
        return this.dom_wrapper;
    }
    update(inputs) {
        console.log(inputs)
        for (let input of inputs) {
            console.log(input)
            if (!this.inputs[input]) {
                this.inputs[input] = new bamVariable(input, false, false);
                this.inputs[input].setParent(this.dom_pred_mapping)
                this.inputs[input].updateMappingOptions(this.dom_pred_datasets_manager.get());
                // this.inputs[input].onChangeCallback = function() {
            }
        }
        // for (let input in this.inputs) {
        //     if (inputs.indexOf(input) === -1) {
        //         this.inputs[input].delete();
        //         delete this.inputs[input];
        //     }
        // }
        this.onChange();
    }
    onChange() {

    }
    getValidityStatus() {

    }
    get() {

    }
    set(config) {
        
    }
}