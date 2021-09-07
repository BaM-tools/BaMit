/**
 * @description
 * A BaM run component extending a BaM generic component.
 * Its purpose is: 
 * (1) display any error in the specification of prior parameter distribution, 
 *     calibration data, and if any, in the prediction experiments
 * (3) propose options to configure MCMC simulations
 * (4) launch BaM
 * 
 * @author Ivan Horner
 * 
 * @todo implement the run options part
 * @todo add checks for prediction experiments; for now prediction experiments are not implemented in the app (nor in the RBaM package)
 */
class bamCalRun extends bamComponent {
    constructor() {
        super();

        this.title_key = "run_title";

        // **********************************************************
        // main wrapper
        this.dom_bamrun = document.createElement("div");
        this.dom_bamrun.className = "bam-run";
        this.dom_content.append(this.dom_bamrun);

        // **********************************************************
        // MCMC options


        // **********************************************************
        // bam action button div
        const dom_actions_div = document.createElement("div")
        dom_actions_div.id = "actions"
        this.dom_bamrun.append(dom_actions_div);

        // run bam button
        this.dom_run_btn = document.createElement("button");
        this.dom_run_btn.id = "run"
        bamI.set(this.dom_run_btn).key("run_runbam").text().apply();
        this.dom_run_btn.addEventListener("click", () => {
            this.onRunBamCallback()
        })
        dom_actions_div.append(this.dom_run_btn);

        // **********************************************************
        // bam monitoring object
        // this.bamMonitor = new bamMonitoring();

    }

    
    setCalibrationValidity(isValid) {
        if (isValid) {
            this.dom_run_btn.disabled = false;
        } else {
            this.dom_run_btn.disabled = true;
        }
    }

    // errorMessageManagement(config) {
    //     if (config.config.priors) {
    //         this.addMessage("calib_priors_invalid", "calib_priors_invalid", "error");
    //         this.isvalid = false;
    //     } else {
    //         this.isvalid = true;
    //         this.removeMessage("calib_priors_invalid")
    //     }
    // }

    getBaMconfig() {
        return this.get();
    }
    get() {
        return {};
    }
    set(config) {
    }
}

