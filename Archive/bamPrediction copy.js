class bamPrediction extends bamComponent {
    constructor() {
        super();
        let self = this;
        

        // **********************************************************
        // editable title
        this.title_key = "prediction_title";
        const header = this.dom_header.querySelector(".bam-component-title")
        this.dom_header_generic = document.createElement("span");
        this.dom_header_generic.className = "bam-prediction-title-generic";
        this.dom_header_custom = document.createElement("span");
        this.dom_header_custom.className = "bam-prediction-title-custom";
        header.append(this.dom_header_generic)
        header.append(this.dom_header_custom)

        // **********************************************************
        // tab buttons
        this.dom_tab_buttons = document.createElement("div");
        this.dom_tab_buttons.className = "tab-buttons";
        this.dom_content.append(this.dom_tab_buttons);

        this.dom_tab_btn_config = document.createElement("button");
        this.dom_tab_btn_config.textContent = "Configuration";
        this.dom_tab_btn_config.addEventListener("click", function() {
            self.openTab(this, "config");
            
        })
        this.dom_tab_buttons.append(this.dom_tab_btn_config);

        this.dom_tab_btn_files = document.createElement("button");
        this.dom_tab_btn_files.textContent = "Result files";
        this.dom_tab_btn_files.addEventListener("click", function() {
            self.openTab(this, "files");
            
        })
        this.dom_tab_buttons.append(this.dom_tab_btn_files);
        
        // **********************************************************
        // tab content
        this.dom_tab_content = document.createElement("div");
        this.dom_tab_content.className = "tab-content";
        this.dom_content.append(this.dom_tab_content);

        this.tabs = {
            config: new bamPredictionConfiguration(),
            files: new bamPredictionResultFiles()
        }
        this.tabs.config.onDeletePredictionCallback = function() {
            self.onDeletePredictionCallback();
        }

        this.dom_tab_btn_config.click(); // default tab;
    }

    // setParent is redefined here to handle the custom component name
    setParent(parent) {
        // set parent:
        parent.append(this.dom_wrapper);
        this.parent = parent;
        // set name:
        bamI.set(this.dom_header_generic).key(this.title_key).text().apply()
        // this.dom_header_custom.textContent =  "untitled"
    }
    // addExternalNamedItem is redefined here to handle the custom component name
    addExternalNamedItem(item) {
        // const header = this.dom_header.querySelector(".bam-component-title")
        const dom_header_generic = document.createElement("span");
        dom_header_generic.className = "bam-prediction-title-generic";
        const dom_header_custom = document.createElement("span");
        dom_header_custom.className = "bam-prediction-title-custom";
        item.append(dom_header_generic)
        item.append(dom_header_custom)
        bamI.set(dom_header_generic).key(this.title_key).text().apply()
        dom_header_custom.textContent = this.dom_header_custom.textContent;
    }
    setPredictionName(name) {
        // console.log("changing the name of the prediction... " + name) 
        // console.log(this.dom_header_custom.textContent);
        // this.dom_header_custom.textContent = "";
        // console.log(this.dom_header_custom.textContent);
        this.dom_header_custom.textContent = name;
        // console.log(this.dom_header_custom.textContent);
    }
    openTab(btn, tab_name) {
        if (!btn.hasAttribute("opened")) {
            const btns = this.dom_tab_buttons.querySelectorAll("button");
            btns.forEach(function(btn) {
                btn.removeAttribute("opened");
            })
            btn.setAttribute("opened", "");
            this.dom_tab_content.innerHTML = "";
            this.dom_tab_content.append(this.tabs[tab_name].getDOM());
            if (this.parent) {
                this.parent.scrollTo({
                    top: this.getTopLocation(),
                    behavior: "smooth"
                })
            }
        }
    }

    update(inputs) {
        this.tabs.config.update(inputs);
    }
    onChange() {

    }
    getValidityStatus() {

    }
    get() {

    }
    set(config) {
        
    }
}