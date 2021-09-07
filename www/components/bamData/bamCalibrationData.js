/**
 * @description
 * Calibration data BaM component extending a basic BaM component
 * It contains (1) a dataset import/management class, (2) a dataset viewer class (a simple table)
 * and (3) a variable--dataset/column mapping class.
 * It manages all the interactions between these 3 components through callbacks.
 * Depending on the model specification, it is populated with the inputs and outputs variable of 
 * the model in the mapping section of the component.
 * 
 * @author Ivan Horner
 */
class bamCalibrationData extends bamComponent {
    constructor() {
        super();

        // objects containing the current input and output variables
        this.inputs = {};
        this.outputs = {};
        
        // change bamComponent name
        // bamI.set(this.dom_header.querySelector(".bam-component-title")).key("caldata_title").text().apply()
        this.title_key = "caldata_title";

        // **********************************************************
        // main wrapper to manage the layout for this component
        const dom_calibration_data = document.createElement("div");
        dom_calibration_data.className = "bam-calibration-data";
        this.dom_content.append(dom_calibration_data)

        // **********************************************************
        // div containing the dataset import/listing section
        const dom_datasets = document.createElement("div");
        dom_datasets.id = "datasets";
        dom_calibration_data.append(dom_datasets);

        // **********************************************************
        // div (not visible at first) containing the dataset viewer
        const dom_viewer = document.createElement("div");
        dom_viewer.id = "viewer";
        dom_calibration_data.append(dom_viewer);

        // **********************************************************
        // create the dataset import/listing object and make it interact with 
        // > bamDatasetViewer
        // > all bamVariable objects
        
        this.datasets = new bamDatasets(5000000, 1000); // 500 ko
        this.datasets.setParent(dom_datasets);
        this.datasets.onDisplayDatasetCallback = function(dataset) {
            let name = dom_viewer.querySelector(".name");
            if (name && name.textContent === dataset.name) return;
            dom_viewer.innerHTML = "";
            new bamDatasetViewer(dataset, dom_viewer)
        }
        this.datasets.onDeleteDatasetCallback = function(to_delete_dataset_name) {
            let name = dom_viewer.querySelector(".name");
            if (name && name.textContent === to_delete_dataset_name) {
                dom_viewer.innerHTML = "";
            }
        };
        this.datasets.onChangeCallback = () => {
            const mapping_options = this.datasets.getDatasetsMappingOptions(false);
            for (let v in this.inputs) {
                this.inputs[v].updateMappingOptions(mapping_options);
            }
            for (let v in this.outputs) {
                this.outputs[v].updateMappingOptions(mapping_options);
            }
            this.onChange();
        }

        // **********************************************************
        // mapping section: inputs/outputs mapping with the imported dataset
        this.dom_mapping = document.createElement("div");
        this.dom_mapping.className = "mapping";
        dom_calibration_data.append(this.dom_mapping);

        // mapping header
        const dom_mapping_header = document.createElement("div");
        dom_mapping_header.className = "mapping-header"
        this.dom_mapping.append(dom_mapping_header);

        // mapping help
        const dom_mapping_header_help = document.createElement("div");
        bamI.set(dom_mapping_header_help).key("caldata_mapper_header").text().apply();
        dom_mapping_header.append(dom_mapping_header_help)
        
        // input section
        const dom_mapping_inputs = document.createElement("div");
        dom_mapping_inputs.className = "inputs";
        this.dom_mapping.append(dom_mapping_inputs);
        const dom_mapping_inputs_header = document.createElement("div");
        dom_mapping_inputs_header.className = "header";
        dom_mapping_inputs.append(dom_mapping_inputs_header);
        bamI.set(dom_mapping_inputs_header).key("variable_inputs").text().apply();

        // output section
        const dom_mapping_outputs = document.createElement("div");
        dom_mapping_outputs.className = "outputs";
        this.dom_mapping.append(dom_mapping_outputs)
        const dom_mapping_outputs_header = document.createElement("div");
        dom_mapping_outputs_header.className = "header";
        dom_mapping_outputs.append(dom_mapping_outputs_header);
        bamI.set(dom_mapping_outputs_header).key("variable_outputs").text().apply();
    }

    onChange() {
        const config = this.get();
        this.errorMessageManagement(config);
        this.checkConfigOutdating();
        if (this.onChangeCallback) this.onChangeCallback();
    }
    
    errorMessageManagement(config) {
        // rules are: 
        // > each variable should be valid meaning: 
        //   > v must be specified
        //   > if b is specified, bindex must be specified
        // > for a given variable, length of specified vectors should match and not be 0
        // > all variables must have the same length
        this.clearMessages("error");
        let hasError = false;
        let variables_lengths = [];
        for (let v in config.inputs) {
            if (config.inputs[v].mapping.v === "-") {
                this.addThreePartsErrorMessage("run_input", " "+v+": ", "run_data_missing", v+"_run_data_missing");
                hasError = true;
            } 
            if ((config.inputs[v].mapping.b !== "-" &&
                config.inputs[v].mapping.bindex === "-") || 
                (config.inputs[v].mapping.b === "-" &&
                config.inputs[v].mapping.bindex !== "-")) {
                    // FIXME: a different message is needed here
                    // But actually, this is overkill since b/bindex are not accessible by the user for now
                    // and likely never.
                    this.addThreePartsErrorMessage("run_input", " "+v+": ", "run_data_missing", v+"_run_data_missing2");
                    hasError = true;
            }
            // Here, I need to use the original dataset object to use its methods
            // it violates the idea that error management should only rely on the config object... :(
            let v_length = this.datasets.getVariableLength(config.inputs[v].mapping.v);
            let u_length = this.datasets.getVariableLength(config.inputs[v].mapping.u);
            let b_length = this.datasets.getVariableLength(config.inputs[v].mapping.b);
            let i_length = this.datasets.getVariableLength(config.inputs[v].mapping.bindex);
            if (u_length === 0) u_length = v_length; // if unspecified, make it the length of v
            if (b_length === 0) b_length = v_length; // ""
            if (i_length === 0) i_length = v_length; // ""
            if (v_length !== u_length || v_length !== b_length || v_length !== i_length) {
                // FIXME: a different message is needed here
                this.addThreePartsErrorMessage("run_input", " "+v+": ", "run_data_lengthissue", v+"run_data_onelengthissue");
                hasError = true;
            }
            if (v_length !== 0) variables_lengths.push(v_length);
            
        }
        for (let v in config.outputs) {
            if (config.outputs[v].mapping.v === "-") {
                this.addThreePartsErrorMessage("run_output", " "+v+": ", "run_data_missing", v+"_run_data_missing");
                hasError = true;
            } 
            if ((config.outputs[v].mapping.b !== "-" &&
                config.outputs[v].mapping.bindex === "-") || 
                (config.outputs[v].mapping.b === "-" &&
                config.outputs[v].mapping.bindex !== "-")) {
                    // FIXME: a different message is needed here
                    // But actually, this is overkill since b/bindex are not accessible by the user for now
                    // and likely never.
                    this.addThreePartsErrorMessage("run_output", " "+v+": ", "run_data_missing", v+"_run_data_missing2");
                    hasError = true;
            }
            // Here, I need to use the original dataset object to use its methods
            // it violates the idea that error management should only rely on the config object... :(
            let v_length = this.datasets.getVariableLength(config.outputs[v].mapping.v);
            let u_length = this.datasets.getVariableLength(config.outputs[v].mapping.u);
            let b_length = this.datasets.getVariableLength(config.outputs[v].mapping.b);
            let i_length = this.datasets.getVariableLength(config.outputs[v].mapping.bindex);
            if (u_length === 0) u_length = v_length; // if unspecified, make it the length of v
            if (b_length === 0) b_length = v_length; // ""
            if (i_length === 0) i_length = v_length; // ""
            if (v_length !== u_length || v_length !== b_length || v_length !== i_length) {
                // FIXME: a different message is needed here
                this.addThreePartsErrorMessage("run_output", " "+v+": ", "run_data_lengthissue", v+"run_data_onelengthissue");
                hasError = true;
            }
            if (v_length !== 0) variables_lengths.push(v_length);
        }
        if (Math.min(...variables_lengths) !== Math.max(...variables_lengths) && Math.min(...variables_lengths) !== Infinity) {
            this.addMessage("run_data_lengthissue", "run_data_lengthissue", "error");
            hasError = true;
        }
        this.isvalid = !hasError;
    }


    getBaMconfig() {
        // these should be arrays?? to make sure the order matches with xtra info
        const inputs = {v: {}, u: {}, b:{}, bindex: {}};
        for (let v in this.inputs) {
            let mapping_codes = this.inputs[v].getMapping();
            for (let m in mapping_codes) {
                inputs[m][v] = this.datasets.getVariable(mapping_codes[m])
            }
        }
        const outputs =  {v: {}, u: {}, b:{}, bindex: {}};
        for (let v in this.outputs) {
            let mapping_codes = this.outputs[v].getMapping();
            for (let m in mapping_codes) {
                outputs[m][v] = this.datasets.getVariable(mapping_codes[m])
            }
        }
        return {inputs: inputs, outputs: outputs};
    }
    get() { 
        const datasets = this.datasets.get();
        const inputs = {};
        const outputs = {};
        for (let v in this.inputs) {
            inputs[v] = this.inputs[v].get();
        }
        for (let v in this.outputs) {
            outputs[v] = this.outputs[v].get();
        }
        const out = {
            datasets: datasets,
            inputs: inputs, 
            outputs: outputs
        };
        return out;
    }
    set(config) {
        // set dataset
        this.datasets.set(config.datasets)
        const mapping_options = this.datasets.getDatasetsMappingOptions(false);
        // set inputs
        const dom_inputs = this.dom_mapping.querySelector(".inputs");
        for (let v in config.inputs) {
            if (!this.inputs[v]) {
                this.inputs[v] = new bamVariable(false, false);
                this.inputs[v].setParent(dom_inputs);
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
        // set outputs
        const dom_outputs = this.dom_mapping.querySelector(".outputs"); 
        for (let v in config.outputs) {
            if (!this.outputs[v]) {
                this.outputs[v] = new bamVariable(true, false);
                this.outputs[v].setParent(dom_outputs);
                this.outputs[v].onChangeCallback = () => {
                    this.onChange();
                }
            }
            if (!config.outputs[v].mapping_options) {
                config.outputs[v].mapping_options = mapping_options;
            }
            this.outputs[v].set(config.outputs[v])
        }
        for (let v in this.outputs) {
            if (!config.outputs[v]) {
                this.outputs[v].delete();
                delete this.outputs[v];
            }
        }
        // trigger on change to check validity of current configuration
        this.onChange();
    }    
}

