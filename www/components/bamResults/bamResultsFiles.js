class bamResultsFiles {
    constructor(name="", all_results="all_results") {
        this.dom_content = document.createElement("div");
        this.dom_content.classList.add("bam-results-files")

        this.dom_panel_files = document.createElement("div");
        this.dom_panel_files.classList.add("file-list");
        this.dom_content.append(this.dom_panel_files);

        this.dom_panel_data = document.createElement("div");
        this.dom_panel_data.classList.add("file-preview");
        this.dom_content.append(this.dom_panel_data);

        this.name = name
        this.all_results = all_results

    }
    // setNames(name, all_results) {
    //     this.name = name
    //     this.all_results = all_results
    // }
    getDOM() {
        return this.dom_content;
    }

    async setupDOM() {
        this.dom_panel_files.innerHTML = ""
        this.dom_panel_data.innerHTML = ""

        const zip = new JSZip();
        for (let f of this.files) {
            console.log("f => ", f)
            const dataset = new bamDataset(f.name+".txt", f.data, {
                preview: () => {
                    this.dom_panel_data.innerHTML = "";
                    new bamDatasetViewer(f, this.dom_panel_data, () => {
                        this.dom_panel_data.innerHTML = "";
                    })
                },
                download: true
            })
            zip.file(dataset.file.name, dataset.file)
            this.dom_panel_files.append(dataset.getDOM())
            console.log("<= done.")
        }
        console.log("creating zip file...")
        const zip_file = await zip.generateAsync({type: "blob"})
        console.log("...done")
        zip_file.name = `${this.name}_${this.all_results}.zip`
        const zip_dataset = new bamFile(zip_file, {
            download: true
        })
        this.dom_panel_files.append(zip_dataset.getDOM())
    }
    
    get() {
        return this.files
    }
    set(config) {
        // config must be an array!
        this.files = config // a file should look like: {name: "mcmc", data: mcmc_data}
        this.setupDOM()
    }
}

class bamCalibResultsFiles extends bamResultsFiles {
    constructor() {
        super(PROJECT_NAME, `calibration_results`)
    }
    
    get() {
        return { 
            mcmc: this.files.filter(f=>f.name===`${this.name}_mcmc`)[0].data,
            residuals: this.files.filter(f=>f.name===`${this.name}_residuals`)[0].data, 
            summary: this.files.filter(f=>f.name===`${this.name}_summary`)[0].data, 
        }
    }
    set(config) {
        const mcmc = {name: `${this.name}_mcmc`, data: config.mcmc};
        const residuals = {name: `${this.name}_residuals`, data: config.residuals};
        const summary = {name: `${this.name}_summary`, data: config.summary};
        super.set([
            mcmc, 
            residuals,
            summary
        ])
    }
}

class bamPredResultsFiles extends bamResultsFiles {
    constructor(pred_name) {
        super(PROJECT_NAME, `${pred_name}_results`)
    }
    set(config) {
        super.set(config)
    }
}

