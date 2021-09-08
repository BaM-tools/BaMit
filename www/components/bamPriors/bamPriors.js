/**
 * @description
 * Prior specification BaM component extending a basic BaM component.
 * Depending on the model specification (e.g. TextFile, BaRatin, etc.) it is populated with
 * input fields for each model parameters to specify their prior distributions and initial values.
 * 
 * @author Ivan Horner
 */
class bamPriors extends bamComponent {
    constructor() {
        super();
        
        // bamI.set(this.dom_header.querySelector(".bam-component-title")).key("priors_title").text().apply();
        this.title_key = "priors_title";
        this.component_type_id = "par"
        
        // Object containing the bamParameter objects
        this.parameters = {};

        // main wrapper
        this.dom_bam_priors = document.createElement("div");
        this.dom_bam_priors.className = "bam-priors";
        this.dom_content.append(this.dom_bam_priors);

        // header text
        const dom_priors_header = document.createElement("div");
        dom_priors_header.id = "header";
        bamI.set(dom_priors_header).key("priors_header").text().apply();
        this.dom_bam_priors.append(dom_priors_header);

        // "column" names 
        const dom_priors_columns = document.createElement("div");
        dom_priors_columns.id = "columns";
        dom_priors_columns.append(document.createElement("p")); // empty
        this.dom_bam_priors.append(dom_priors_columns);

        const dom_initial_header = document.createElement("div")
        bamI.set(dom_initial_header).key("priors_initial").text().apply();
        dom_priors_columns.append(dom_initial_header);

        const dom_distribution_header = document.createElement("div")
        bamI.set(dom_distribution_header).key("priors_distribution").text().apply();
        dom_priors_columns.append(dom_distribution_header);

        const dom_distparameters_header = document.createElement("div")
        bamI.set(dom_distparameters_header).key("priors_distparameters").text().apply();
        dom_priors_columns.append(dom_distparameters_header);

    }


    onChange() {
        const config = this.get();
        this.errorMessageManagement(config);
        this.checkConfigOutdating();
        if (this.onChangeCallback) this.onChangeCallback();
    }
    errorMessageManagement(config) {
        // rules are: 
        // > each variable parameter must have an valid initial value specified
        // > if any parameters are associated with the specified distribution
        //   they must be specified with a valid value.
        this.clearMessages("error");
        let hasError = false;
        for (let p in config) {
            if (isNaN(config[p].initial)) {
                this.addThreePartsErrorMessage("run_parameter", " "+p+": ", "run_par_init_missing", p+"_init");
                hasError = true;
            }
            let missing_dist_par = false;
            config[p].dist_parameters.forEach(e=>{if (isNaN(e)) missing_dist_par=true});
            if (missing_dist_par) {
                this.addThreePartsErrorMessage("run_parameter", " "+p+": ", "run_par_distpar_missing", p+"_dist");
                hasError = true;
            }
        }
        this.isvalid = !hasError;
    }
    getBaMconfig() {
        const config = [];
        for (let p in this.parameters) {
            config.push(this.parameters[p].get());
        }
        return config;
    }
    get() {
        const config = {};
        for (let p in this.parameters) {
            config[p] = this.parameters[p].get();
        }
        return config;
    }
    set(config) {
        for (let p in config) {
            if (!this.parameters[p]) {
                this.parameters[p] = new bamParameter(); 
                this.parameters[p].setParent(this.dom_bam_priors);
                this.parameters[p].onChangeCallback = () => {
                    this.onChange();
                }
            }
            this.parameters[p].set(config[p]);
        }
        for (let p in this.parameters) {
            if (!config[p]) {
                this.parameters[p].delete();
                delete this.parameters[p];
            }
        }
        this.onChange();
    }
}