class bamResultsFiles {
    constructor() {
        this.dom_content = document.createElement("div");
        this.dom_content.classList.add("bam-results-files")

        this.dom_panel_files = document.createElement("div");
        this.dom_panel_files.classList.add("file-select");
        this.dom_content.append(this.dom_panel_files);

        this.dom_panel_data = document.createElement("div");
        this.dom_panel_data.classList.add("file-display");
        this.dom_content.append(this.dom_panel_data);

    }
    getDOM() {
        return this.dom_content;
    }
    
    updateTEST(id) {
        // async function getFile() {
        //     let response = await fetch("bam_workspace/"+id+"/Results_Summary.txt")
        //     if (response.status != 200) {
        //         throw new Error("Server error");
        //     }
        //     console.log(response);
        // }
        // getFile();

        Papa.parse("bam_workspace/"+id+"/Results_Summary.txt", {
            download: true,
            complete: function(results) {
                console.log(results);
            }
        });

        var xhr = new XMLHttpRequest(); 
        xhr.open("GET", "bam_workspace/"+id+"/Results_Summary.txt"); 
        // xhr.open("GET", "bam_workspace/"+id+"/Results_Residuals.txt"); 
        xhr.responseType = "blob";//force the HTTP response, response-type header to be blob
        xhr.onload = function() 
        {
            console.log(xhr.response)
            console.log(typeof xhr.response)
            console.log(xhr.response.constructor.name)
            // xhr.response.text().then(data=>{
            //     console.log(data)
            //     console.log(data.split())
            //     console.log(data.replace(/\s+/g,' ').trim().split())
            //     Papa.parse(data.replace(/\s+/g,' ').trim(), {
            //         header: true,
            //         dynamicTyping: true,
            //         complete: function(res) {
            //             console.log(res);
            //         }
            //     })
            // })
            
            // Papa.parse(xhr.response, {
            //     complete: function(res) {
            //         console.log(res);
            //     }
            // })
        }
        xhr.send();

    }

    setupDOM() {

        this.dom_panel_files.innerHTML = "";
        this.dom_panel_data.innerHTML = "";
        let self = this;
        // MCMC file
        // this.mcmc = {name: "mcmc", data: mcmc};
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
        })
        // Residuals file
        // this.residuals = {name: "residuals", data: residuals};
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
        })
        // Summary file
        // this.summary = {name: "summary", data: summary};
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
        })

        // **********************************************************
        // the following section is about downloading the files
        // including a zip file containing all the files
        // this will likely need to be added to bamDatasetView class
        // except for the zip file
        function processDataForFile(dataset) {
            const headers = Object.keys(dataset);
            const nrow    = dataset[headers[0]].length;
            const ncol    = headers.length;
            const data    = []
            for (let j=0; j < ncol; j++) {
                data.push(headers[j])
                if (j!=(headers.length-1)) {
                    data.push("\t");
                } else {
                    data.push("\r\n");
                }
            }
            for (let i=0; i < nrow; i++) {
                for (let j=0; j < ncol; j++) {
                    data.push(dataset[headers[j]][i])
                    if (j!=(ncol-1)) {
                        data.push("\t");
                    } else {
                        data.push("\r\n");
                    }
                }
            }
            console.log(data)
            return data;
        }
        
        function createDownloadButton(callback) {
            const btn = document.createElement("button");
            btn.className = "bam-btn-simple";
            btn.addEventListener("click", function() {
                const file = callback();
                const a = document.createElement("a");
                a.href = URL.createObjectURL(file);
                a.download = file.name;
                a.click();               
            })
            return btn;
        }

        const dom_btn_mcmc = createDownloadButton(function() {
            return new File(processDataForFile(self.mcmc.data), "mcmc.txt", {type: "text/plain"});
        });
        dom_btn_mcmc.textContent = "mcmc.txt";
        this.dom_panel_files.append(dom_btn_mcmc)

        const dom_btn_residuals = createDownloadButton(function() {
            return new File(processDataForFile(self.residuals.data), "residuals.txt", {type: "text/plain"});
        });
        dom_btn_residuals.textContent = "residuals.txt";
        this.dom_panel_files.append(dom_btn_residuals)

        const dom_btn_summary = createDownloadButton(function() {
            return new File(processDataForFile(self.summary.data), "summary.txt", {type: "text/plain"});
        });
        dom_btn_summary.textContent = "summary.txt";
        this.dom_panel_files.append(dom_btn_summary)


        const dom_btn_zip = document.createElement("button");
        dom_btn_zip.className = "bam-btn-simple";
        dom_btn_zip.textContent = "allResults.zip";
        dom_btn_zip.addEventListener("click", function() {
            let f;
            const zip = new JSZip();
            f = new File(processDataForFile(self.mcmc.data), "mcmc.txt", {type: "text/plain"})
            zip.file(f.name, f)
            f = new File(processDataForFile(self.summary.data), "summary.txt", {type: "text/plain"})
            zip.file(f.name, f)
            f = new File(processDataForFile(self.residuals.data), "residuals.txt", {type: "text/plain"})
            zip.file(f.name, f)
            zip.generateAsync({type: "blob"}).then(file=> {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(file);
                a.download = "allResults.zip";
                a.click();          
            })
        });
        this.dom_panel_files.append(dom_btn_zip)

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

