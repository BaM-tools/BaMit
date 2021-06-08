class bamResultsFiles extends bamTabOLD{
    constructor(parent, master_parent) {
        super(parent)
        this.master_parent = master_parent
        this.dom_content = document.createElement("div");
        this.dom_content.classList.add("bam-results-tab-content-files")
        this.dom_main.append(this.dom_content);

        this.dom_panel_files = document.createElement("div");
        this.dom_panel_files.classList.add("file-select");
        this.dom_content.append(this.dom_panel_files);

        this.dom_panel_data = document.createElement("div");
        this.dom_panel_data.classList.add("file-display");
        this.dom_content.append(this.dom_panel_data);

        this.hide()
    }
    update(mcmc, residuals, summary) {
        this.dom_panel_files.innerHTML = "";
        this.dom_panel_data.innerHTML = "";
        let self = this;
        // MCMC
        this.mcmc = {name: "mcmc", data: mcmc};
        const f_mcmc = document.createElement("div")
        f_mcmc.classList.add("select-btn");
        this.dom_panel_files.append(f_mcmc)
        f_mcmc.textContent = "MCMC"
        f_mcmc.addEventListener("click", function() {
            self.dom_panel_data.innerHTML = "";
            new bamDatasetViewer(self.mcmc, self.dom_panel_data, function() {
                f_mcmc.removeAttribute("selected");
            })
            f_residuals.removeAttribute("selected")
            f_summary.removeAttribute("selected")
            f_mcmc.setAttribute("selected", "")
            self.master_parent.parent.scrollTo({
                top: self.master_parent.getTopLocation(),
                behavior: "smooth"
            })
        })
        // Residuals
        this.residuals = {name: "residuals", data: residuals};
        const f_residuals = document.createElement("div")
        f_residuals.classList.add("select-btn");
        this.dom_panel_files.append(f_residuals)
        f_residuals.textContent = "Residuals"
        f_residuals.addEventListener("click", function() {
            self.dom_panel_data.innerHTML = "";
            new bamDatasetViewer(self.residuals, self.dom_panel_data, function() {
                f_residuals.removeAttribute("selected");
            })
            f_mcmc.removeAttribute("selected")
            f_summary.removeAttribute("selected")
            f_residuals.setAttribute("selected", "")
            self.master_parent.parent.scrollTo({
                top: self.master_parent.getTopLocation(),
                behavior: "smooth"
            })
        })
        // Summary
        this.summary = {name: "summary", data: summary};
        const f_summary = document.createElement("div")
        f_summary.classList.add("select-btn");
        this.dom_panel_files.append(f_summary)
        f_summary.textContent = "Summary"
        f_summary.addEventListener("click", function() {
            self.dom_panel_data.innerHTML = "";
            new bamDatasetViewer(self.summary, self.dom_panel_data, function() {
                f_summary.removeAttribute("selected");
            })
            f_mcmc.removeAttribute("selected")
            f_residuals.removeAttribute("selected")
            f_summary.setAttribute("selected", "")
            self.master_parent.parent.scrollTo({
                top: self.master_parent.getTopLocation(),
                behavior: "smooth"
            })
        })

    }
    get() {
        return {
            mcmc: this.mcmc.data,
            residuals: this.residuals.data, 
            summary: this.summary.data
        }
    }
    set(config) {
        this.update(config.mcmc, config.residuals, config.summary)
    }
}

