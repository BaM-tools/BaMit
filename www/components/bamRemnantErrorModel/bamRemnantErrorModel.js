/**
 * @description
 * BaM component for the specification of the outputs remnant error model specification. 
 * It extends a basic BaM component.
 * 
 * @author Ivan Horner
 */
class bamRemnantErrorModel extends bamComponent {
    constructor() {
        super();

        // bamI.set(this.dom_header.querySelector(".bam-component-title")).key("remnanterror_title").text().apply();
        this.title_key = "remnanterror_title";
        this.component_type_id = "err"
        // this.dom_wrapper.toggleAttribute("collapsed");

        this.outputs = {};

        // main wrapper
        this.dom_remnant_errors_wrapper = document.createElement("div")
        this.dom_remnant_errors_wrapper.className = "bam-remnant-errors"
        this.dom_content.append(this.dom_remnant_errors_wrapper)

        // component header
        const dom_header = document.createElement("div");
        const dom_header_general = document.createElement("div");
        const dom_header_details = document.createElement("div");
        dom_header.append(dom_header_general)
        dom_header.append(dom_header_details)
        bamI.set(dom_header_general).key("remnanterror_header").text().apply()
        bamI.set(dom_header_details).key("remnanterror_header_details").text().apply()
        dom_header_general.style.padding = "0.8rem";
        dom_header_details.style.fontSize = "0.8em";
        dom_header_details.style.padding = "0.8rem";
        dom_header_details.style.paddingTop = "0";
        this.dom_remnant_errors_wrapper.append(dom_header);

        // column headers
        const dom_col_header = document.createElement("div");
        dom_col_header.className = "headers";
        this.dom_remnant_errors_wrapper.append(dom_col_header)
        // 1/ Model
        const dom_col_header_model = document.createElement("div");
        dom_col_header_model.classList.add("header-model");
        dom_col_header_model.classList.add("underlined");
        bamI.set(dom_col_header_model).key("remnanterror_model").text().apply();
        dom_col_header.append(dom_col_header_model);
        // 2/ Model parameters
        const dom_col_header_parameters = document.createElement("div");
        dom_col_header_parameters.classList.add("header-parameters");
        dom_col_header_parameters.classList.add("underlined");
        bamI.set(dom_col_header_parameters).key("remnanterror_parameters").text().apply();
        dom_col_header.append(dom_col_header_parameters);

        // column sub headers
        // 1/ Initial value
        const dom_col_subheader_initial = document.createElement("div")
        dom_col_subheader_initial.classList.add("header-initial");
        dom_col_subheader_initial.classList.add("no-underlined");
        bamI.set(dom_col_subheader_initial).key("priors_initial").text().apply();
        dom_col_header.append(dom_col_subheader_initial);
        // 2/ Distribution
        const dom_col_subheader_distribution = document.createElement("div")
        dom_col_subheader_distribution.classList.add("header-distribution");
        dom_col_subheader_distribution.classList.add("no-underlined");
        bamI.set(dom_col_subheader_distribution).key("priors_distribution").text().apply();
        dom_col_header.append(dom_col_subheader_distribution);
        // 3/ Distribution's parameters
        const dom_col_subheader_distparameters = document.createElement("div")
        dom_col_subheader_distparameters.classList.add("header-distparameters");
        dom_col_subheader_distparameters.classList.add("no-underlined");
        bamI.set(dom_col_subheader_distparameters).key("priors_distparameters").text().apply();
        dom_col_header.append(dom_col_subheader_distparameters);

        // content
        this.dom_remnant_errors_content = document.createElement("div");
        this.dom_remnant_errors_wrapper.append(this.dom_remnant_errors_content)

    }

    onChange() {
        const config = this.get();
        this.errorMessageManagement(config);
        this.checkConfigOutdating();
        if (this.onChangeCallback) this.onChangeCallback()
    }
    errorMessageManagement(config) {
        // rules are: 
        // for each output variables, the parameterization of the model parameters must be
        // valid:
        //   > each variable parameter must have an valid initial value specified
        //   > if any parameters are associated with the specified distribution
        //     they must be specified with a valid value.
        this.clearMessages("error");
        let hasError = false;
        for (let o in config) {
            for (let p of config[o].parameters) {
                // messages.push(buildSingleMessage("run_remnant_missing", s, "run_output_errormodel"))
                if (isNaN(p.initial)) {
                    this.addThreePartsErrorMessage("run_parameter", " "+o+"_"+p.name+": ", "run_par_init_missing", o+"_"+p.name+"_init");
                    hasError = true;
                }
                let missing_dist_par = false;
                p.dist_parameters.forEach(e=>{if (isNaN(e)) missing_dist_par=true});
                if (missing_dist_par) {
                    this.addThreePartsErrorMessage("run_parameter", " "+o+"_"+p.name+": ", "run_par_distpar_missing", o+"_"+p.name+"_dist");
                    hasError = true;
                }
            }
        }
        this.isvalid = !hasError;
    }

    getBaMconfig() {
        return this.get();
    }

    get() {
        const config = {};
        for (let o in this.outputs) {
            config[o] = this.outputs[o].get();
        } 
        return config;
    }

    set(config) {
        for (let o in config) {
            if (!this.outputs[o]) {
                this.outputs[o] = new bamErrorModel(o);
                this.outputs[o].setParent(this.dom_remnant_errors_content);
                this.outputs[o].onChangeCallback = () => {
                    this.onChange();
                }
            }
            this.outputs[o].set(config[o]);
        }
        for (let o in this.outputs) {
            if (!config[o]) {
                this.outputs[o].delete();
                delete this.outputs[o];
            }
        }
    }
}