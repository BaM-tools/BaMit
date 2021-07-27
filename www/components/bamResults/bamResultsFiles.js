class bamResultsFiles {
    constructor() {
        this.dom_content = document.createElement("div");
        this.dom_content.classList.add("bam-results-files")

        this.dom_panel_files = document.createElement("div");
        this.dom_panel_files.classList.add("file-list");
        this.dom_content.append(this.dom_panel_files);

        this.dom_panel_data = document.createElement("div");
        this.dom_panel_data.classList.add("file-preview");
        this.dom_content.append(this.dom_panel_data);

        this.n = 0
    }
    getDOM() {
        return this.dom_content;
        
    }

    async setupDOM() {
        console.log("this.mcmc", this.mcmc)
        console.log("this.residuals", this.residuals)
        console.log("this.summary", this.summary)
        
        const createDataset = (data) => {
            return new bamDataset(data.name+".txt", data.data, {
                preview: () => {
                    console.log("preview ", data.name+".txt" )
                    this.dom_panel_data.innerHTML = "";
                    new bamDatasetViewer(data, this.dom_panel_data, () => {
                        this.dom_panel_data.innerHTML = "";
                    })
                },
                download: true
            })
        }

        this.dom_panel_files.innerHTML = ""
        const mcmc_dataset = createDataset(this.mcmc)
        this.dom_panel_files.append(mcmc_dataset.getDOM())
        const residuals_dataset = createDataset(this.residuals)
        this.dom_panel_files.append(residuals_dataset.getDOM())
        const summary_dataset = createDataset(this.summary)
        this.dom_panel_files.append(summary_dataset.getDOM())

        const zip = new JSZip();
        zip.file(mcmc_dataset.file.name, mcmc_dataset.file)
        zip.file(residuals_dataset.file.name, residuals_dataset.file)
        zip.file(summary_dataset.file.name, summary_dataset.file)
        const zip_file = await zip.generateAsync({type: "blob"})
        console.log(zip_file)
        zip_file.name = "all_results.zip"
        const zip_dataset = new bamFile(zip_file, {
            download: true
        })
        this.dom_panel_files.append(zip_dataset.getDOM())

        console.trace()
    }
    
    get() {
        return {
            mcmc: this.mcmc.data,
            residuals: this.residuals.data, 
            summary: this.summary.data
        }
    }
    set(config) {
        this.mcmc = {name: "mcmc", data: config.mcmc};
        this.residuals = {name: "residuals", data: config.residuals};
        this.summary = {name: "summary", data: config.summary};
        this.setupDOM()
    }
}

