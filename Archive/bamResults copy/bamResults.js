/**
 * @description
 * BaM result component class extenting a generic BaM component.
 * Its purpose is to display the generic results of a BaM run: 
 * (1) MCMC line plots
 * (2) MCMC densities
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
        // bamI.set(this.dom_header.querySelector(".bam-component-title")).key("results_title").text().apply();
        this.title_key = "results_title"

        // create the main content of this component
        this.dom_results = document.createElement("div");
        this.dom_results.className = "bam-results";
        this.dom_content.append(this.dom_results);

        // tab buttons
        const dom_tab_buttons = document.createElement("div");
        this.dom_results.append(dom_tab_buttons)
        dom_tab_buttons.className = "tab-buttons"
        
        // parameter tab
        const dom_btn_par = document.createElement("button")
        dom_tab_buttons.append(dom_btn_par)
        dom_btn_par.id = "par"
        dom_btn_par.textContent = "Parameters"
        dom_btn_par.addEventListener("click", function(e) {
            e.stopPropagation()
            self.openTab("par")
        })
        // files tab
        const dom_btn_files = document.createElement("button")
        dom_tab_buttons.append(dom_btn_files)
        dom_btn_files.id = "files"
        dom_btn_files.textContent = "Files/Tables"
        dom_btn_files.addEventListener("click", function(e) {
            e.stopPropagation()
            self.openTab("files")
        })
        // log tab
        const dom_btn_log = document.createElement("button")
        dom_tab_buttons.append(dom_btn_log)
        dom_btn_log.id = "log"
        dom_btn_log.textContent = "Log"
        dom_btn_log.addEventListener("click", function(e) {
            e.stopPropagation()
            self.openTab("log")
        })
        // tab content
        const dom_tab_content = document.createElement("div")
        this.dom_results.append(dom_tab_content)
        dom_tab_content.className = "tab-content"
        this.tabs = {
            par: new bamResultsParameters(dom_tab_content),
            files: new bamResultsFiles(dom_tab_content, this),
            log: new bamResultsLog(dom_tab_content)
        }
        dom_btn_par.click();   

        // only for development purposes (retrieve data to plot without running BaM)
        Shiny.addCustomMessageHandler("retrieve_current_bam_results", function(data) {
            self.update(data);
        })
        // Shiny.setInputValue("ask_for_current_bam_results", "none");
        Shiny.onInputChange("ask_for_current_bam_results", "none");
    }

    openTab(id) {
        const btn = this.dom_results.querySelector("#"+id)
        const btns = this.dom_results.querySelector(".tab-buttons").querySelectorAll("button")
        for (let b of btns) {
            if (b != btn) {
                b.removeAttribute("opened")
                this.tabs[b.id].hide();
            }
        }
        btn.setAttribute("opened", "")
        this.tabs[id].show();
        if (this.parent) {
            this.parent.scrollTo({
                top: this.getTopLocation(),
                behavior: "smooth"
            })
        }
    }
    
    update(data) {
        console.log(data);
        this.tabs.log.update(data.log)
        this.tabs.files.update(data.mcmc, data.residuals, data.summary)
        this.tabs.par.update(data.mcmc, data.mcmc_density)
    }

    get() {
        return {
            log: this.tabs.log.get(),
            files: this.tabs.files.get(),
            par: this.tabs.par.get()
        }
    }
    set(config) {
        this.tabs.log.set(config.log)
        this.tabs.files.set(config.files)
        this.tabs.par.set(config.par)
    }
}


