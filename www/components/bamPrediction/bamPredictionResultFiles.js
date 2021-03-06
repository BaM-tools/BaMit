class bamPredictionResultFiles {
    constructor() {
        // **********************************************************
        // main wrapper
        this.dom_wrapper = document.createElement("div");
        this.dom_wrapper.className = "bam-prediction-result-files";
                
        // this.dom_wrapper.textContent = "no results"
        // this.dom_no_results = document.createElement("div");
        // this.dom_no_results.textContent = "no results"

    }
    setPredictionName(name) {
        this.pred_name = name
    }
    setupDOM() {
        this.dom_wrapper.innerHTML = ""
        if (this.config) {
            const result_files = new bamPredResultsFiles(this.pred_name)
            result_files.set(this.config.files)
            this.dom_wrapper.append(result_files.getDOM())
        }
    }
    getDOM() {
        return this.dom_wrapper;
    }
    // update() {

    // }
    // onChange() {

    // }
    get() {
        return this.config
    }
    set(config) {
        // config must be undefined or an object with the following structure:
        // {inputs, outputs_env, outputs_spag}
        // I also wan't to create a bamFile component with a bamFileText inheriting component
        this.config = config
        this.setupDOM()
    }
}