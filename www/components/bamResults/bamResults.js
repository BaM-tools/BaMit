/**
 * @description
 * BaM result component class extenting a generic BaM component.
 * Its purpose is to display the generic results of a BaM run: 
 * (1) MCMC line plots
 * (2) MCMC densities
 * FIXME: THIS DESCRIPTION IS OUTDATED!
 * 
 * @author Ivan Horner
 * 
 * @todo some plot should be added to display the "residuals" result file of BaM
 * @todo I would very much like to include the prior distribution here as well; how should this be implemented?
 * @todo Also include the results of a default prediction based on calibration data; need the prediction experiment features in RBaM for that
 * @todo re-think the general layout of this component, maybe using tabs, for more
 *       ease in the naviguation between the different results
 */
class bamResults extends bamComponent {
    constructor() {
        super();
        let self = this;
        this.title_key = "results_title"

        // tab system
        this.dom_results = document.createElement("div");
        this.dom_results.className = "bam-results";
        this.dom_content.append(this.dom_results);
        this.dom_tabs = new bamTabs() 
        this.dom_tabs.setParent(this.dom_results)

        // parameter tab
        this.result_parameters = new bamResultsParameters();
        const result_parameters_tab = this.dom_tabs.newTab();
        // result_parameters_tab.getButton().textContent = "Parameters";
        bamI.set(result_parameters_tab.getButton()).key("results_param_tab").text().apply();
        result_parameters_tab.setContent(this.result_parameters.getDOM());
        result_parameters_tab.getButton().click();

        // file tab
        this.result_files = new bamResultsFiles();
        const result_files_tab = this.dom_tabs.newTab();
        // result_files_tab.getButton().textContent = "Result files";
        bamI.set(result_files_tab.getButton()).key("results_files_tab").text().apply();
        result_files_tab.setContent(this.result_files.getDOM());

        // log tab
        this.result_log = new bamResultsLog();
        const result_log_tab = this.dom_tabs.newTab();
        // result_log_tab.getButton().textContent = "BaM log";
        bamI.set(result_log_tab.getButton()).key("results_log_tab").text().apply();
        result_log_tab.setContent(this.result_log.getDOM());
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
    }
}


