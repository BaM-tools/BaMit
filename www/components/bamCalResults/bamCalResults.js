/**
 * @description
 * BaM result component class extenting a generic BaM component.
 * Its purpose is to display the generic results of a BaM calibration run in different tabs: 
 * (1) Parameter tab where plots are displayed with traces and densities
 * (2) Result files tab where result files can be previewed and downloaded
 * (3) BaM log tab where the console outputs are displayed (in case of errors, this is useful)
 * 
 * @author Ivan Horner
 * 
 * @todo some plot should be added to display the "residuals" result file of BaM
 * @todo I would very much like to include the prior distribution here as well; how should this be implemented?
 * @todo Also include the results of a default prediction based on calibration data; need the prediction experiment features in RBaM for that
 */
class bamCalResults extends bamComponent {
    constructor() {
        super();
        this.title_key = "results_title"
        this.component_type_id = "res"
        
        // tab system
        this.dom_results = document.createElement("div");
        this.dom_results.className = "bam-results";
        this.dom_content.append(this.dom_results);
        this.dom_tabs = new bamTabs() 
        this.dom_tabs.setParent(this.dom_results)

        // parameter tab
        this.result_parameters = new bamCalResultsPar();
        const result_parameters_tab = this.dom_tabs.newTab();
        // result_parameters_tab.getButton().textContent = "Parameters";
        bamI.set(result_parameters_tab.getButton()).key("results_param_tab").text().apply();
        result_parameters_tab.setContent(this.result_parameters.getDOM());
        result_parameters_tab.getButton().click();

        // file tab
        // this.result_files = new bamResultsFiles();
        this.result_files = new bamCalResultsFiles();
        const result_files_tab = this.dom_tabs.newTab();
        // result_files_tab.getButton().textContent = "Result files";
        bamI.set(result_files_tab.getButton()).key("results_files_tab").text().apply();
        result_files_tab.setContent(this.result_files.getDOM());

        // log tab
        this.result_log = new bamCalResultsLog ();
        const result_log_tab = this.dom_tabs.newTab();
        // result_log_tab.getButton().textContent = "BaM log";
        bamI.set(result_log_tab.getButton()).key("results_log_tab").text().apply();
        result_log_tab.setContent(this.result_log.getDOM());
    }


    onChange() {
        const config = this.get();
        let isValid = this.errorMessageManagement(config);
        if (this.onChangeCallback) this.onChangeCallback(isValid)
    }

    errorMessageManagement(config) {
        const mcmc  = config.data.mcmc
        // must have several keys, and each key should be array of same length > 0
        this.clearMessages("error");
        let isValid = true
        const keys = Object.keys(mcmc)
        if (keys.length === 0) isValid = false
        if (isValid) {
            const len = keys.map(k=>mcmc[k].length)
            for (let l of len) {
                if (l === 0 || l != len[0]) isValid = false
            }
    }
        if (!isValid) {
            this.addMessage("run_calib_error", "run_calib_error", "error");
        }
        this.isvalid = isValid
        return isValid
    }
    

    getBaMconfig() {
        return this.result_files.get().mcmc;
    }

    get() {
        // to avoid duplicates, create a custom config object
        const files  = this.result_files.get()
        const data = {
            log: this.result_log.get(),
            mcmc: files.mcmc,
            residuals: files.residuals,
            summary: files.summary,
            mcmc_density: this.result_parameters.get().density
        }
        return {
            // parameters: this.parameters,
            // outputs: this.outputs,
            data: data
        };
    }
    set(config) {
        // this.parameters = config.parameters;
        // this.inputs = config.inputs;
        this.result_log.set(config.data.log)
        this.result_files.set({
            mcmc: config.data.mcmc,
            residuals: config.data.residuals,
            summary: config.data.summary
        })
        this.result_parameters.set({
            trace: config.data.mcmc,
            density: config.data.mcmc_density
        })
        this.onChange()
    }
}


