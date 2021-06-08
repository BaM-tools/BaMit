class bamApp {
    constructor(parent) {

        // Config
        this.BaM_Config = {};

        // Project
        this.modelID;
        this.md; // model definition 
        this.pd; // prior distribution
        this.cd; // calibration data
        this.rb; // run bam

        this.bam_projects = [];

        // UI
        this.parent = parent;
        this.buildSidePanel();
        this.buildMainPanel();
        // parent.appendChild(this.dom_sidepanel_wrapper);
        // parent.appendChild(this.dom_mainpanel_wrapper);
        
        parent.prepend(this.dom_mainpanel_wrapper);
        parent.prepend(this.dom_sidepanel_wrapper);
    }

    buildMainPanel() {
        this.dom_mainpanel_wrapper = document.createElement("div");
        this.dom_mainpanel_wrapper.className = "bam-main-panel";
    }
    
    sidePanelElement(id) {
        const wrapper = document.createElement("div")
        wrapper.id = id;
        const header = document.createElement("div")
        header.id = "header";
        const title = document.createElement("div");
        title.id = "title";
        const content = document.createElement("div");
        content.id = "content";
        header.appendChild(title);
        wrapper.appendChild(header);
        wrapper.appendChild(content);
        return wrapper;
    }

    buildSidePanel() {
        let self = this;

        // **********************************************************
        // **********************************************************
        // collapse button and content div
        const dom_collapsebtn = document.createElement("div");
        dom_collapsebtn.id = "bam-sidepanel-collapsebtn";
        // dom_collapsebtn.textContent = "<<";
        dom_collapsebtn.addEventListener("click", function(e) {
            let p = this.parentElement;
            let c = p.querySelector("#bam-sidepanel-content");
            if (p.hasAttribute("collapsed")) {
                p.removeAttribute("collapsed");
                // this.textContent = "<<";
                setTimeout(function() {
                    c.style.display = "flex"
                }, 200);
            } else {
                p.setAttribute("collapsed", "");
                // this.textContent = ">>";
                c.style.display = "none"
            }
            
        })
        const dom_content = document.createElement("div");
        dom_content.id = "bam-sidepanel-content";

        // **********************************************************
        // **********************************************************
        // language picker
        this.dom_languagepicker = this.sidePanelElement("bam-languagepicker");
        _IsetLangAttr(this.dom_languagepicker.querySelector("#title"), "chooselanguage", ["textContent"])
        
        const languagepicker_content = document.createElement("div");
        languagepicker_content.id = "content";
        for (let l in LANGUAGES) {
            let i = document.createElement("img")
            i.src = "./images/" + LANGUAGES[l].image;
            i.addEventListener("click", function() {
                _IupdateDOMtext(l);
            })
            this.dom_languagepicker.querySelector("#content").appendChild(i);
        }

        // **********************************************************
        // **********************************************************
        // model picker
        this.dom_modelpicker = this.sidePanelElement("bam-modelpicker");
        _IsetLangAttr(this.dom_modelpicker.querySelector("#title"), "choosemodel", ["textContent"])

        // text file model ******************************************
        const modelpicker_textfilemodel = document.createElement("button");
        _IsetLangAttr(modelpicker_textfilemodel, "textfile", ["textContent"])
        modelpicker_textfilemodel.addEventListener("click", function() {
            self.createNewBaMproject("TextFile")
        });
        this.dom_modelpicker.querySelector("#content").appendChild(modelpicker_textfilemodel);
        // BaRatin **************************************************
        const modelpicker_baratin = document.createElement("button");
        _IsetLangAttr(modelpicker_baratin, "baratin", ["textContent"])
        modelpicker_baratin.addEventListener("click", function() {
            // self.createNewBaMproject("BaRatin")
        });
        this.dom_modelpicker.querySelector("#content").appendChild(modelpicker_baratin);


        // **********************************************************
        // **********************************************************
        // Project management

        this.dom_projectmanager = this.sidePanelElement("bam-projectmanager");
        _IsetLangAttr(this.dom_projectmanager.querySelector("#title"), "projectmanagement", ["textContent"])

        // Loading a project
        const projectmanager_load = document.createElement("button")
        _IsetLangAttr(projectmanager_load, "loadproject", ["textContent"])
        projectmanager_load.addEventListener("click", function() { self.loadProject() })
        this.dom_projectmanager.querySelector("#content").appendChild(projectmanager_load);

        // Projects list
        const projectmanager_list = document.createElement("div");
        projectmanager_list.id = "bam-projectmanager-list";
        // projectmanager_list.textContent = "qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F qsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< Fqsdmfk qsdefklm qskdùlmf qsdmlkf qùmsdlkf ozpeir agwdhfg mqdfksjlgh qmesj fqsdf 45qd2fg dqfg dsqlkfjZEKR IFhsemkfh dskgmfdSH< F"
        this.dom_projectmanager.querySelector("#content").appendChild(projectmanager_list);

        // const projectmanager_header = document.createElement("div")
        // projectmanager_header.id = "header";
        // const projectmanager_title = document.createElement("div");
        // projectmanager_title.id = "title";
        // _IsetLangAttr(projectmanager_title, "projectmanagement", ["textContent"])
        // projectmanager_header.appendChild(projectmanager_title);
        // const projectmanager_content = document.createElement("div");
        // projectmanager_content.id = "content";
        // // project name
        // const projectmanager_name = document.createElement("input")
        // projectmanager_name.id = "bam-shinierbam-project-name";
        // _IsetLangAttr(projectmanager_name, "project_name", ["placeholder"])
        // projectmanager_content.appendChild(projectmanager_name);

        // // **********************************************************
        // // reset project
        // const projectmanager_reset = document.createElement("button")
        // _IsetLangAttr(projectmanager_reset, "resetproject", ["textContent"])
        // projectmanager_reset.addEventListener("click", function() {
        //     // this.style.backgroundColor = "red";
        //     self.modelID = "RESET";
        // });
        // projectmanager_content.appendChild(projectmanager_reset);
        // // **********************************************************
        // // save project
        // const projectmanager_save = document.createElement("button")
        // _IsetLangAttr(projectmanager_save, "saveproject", ["textContent"])
        // projectmanager_content.appendChild(projectmanager_save);
        // projectmanager_save.addEventListener("click", function() {
        //     if (Object.keys(self.BaM_Config).length == 0) {
        //         new bamMessage(_I("emptyproject_error"), {type: "error"})
        //         return;
        //     }
        //     let JSON_BaM_Config = JSON.stringify(self.BaM_Config)
        //     console.log(JSON_BaM_Config);
        //     let fn = projectmanager_name.value;
        //     if (fn === "") fn = "shinierBaMproject";
        //     let e = document.createElement("a");
        //     e.setAttribute("href", "data:text/json;charset=utf-8, " + encodeURIComponent(JSON_BaM_Config))
        //     e.setAttribute("download", fn + ".json");
        //     e.click();
        // })
        // // **********************************************************
        // // load project
        

        // **********************************************************
        // this.dom_projectmanager = document.createElement("div");
        // this.dom_projectmanager.id = "bam-projectmanager";
        // this.dom_projectmanager.appendChild(projectmanager_header)
        // this.dom_projectmanager.appendChild(projectmanager_content)

        // **********************************************************
        // Side panel wrapper
        this.dom_sidepanel_wrapper = document.createElement("div");
        this.dom_sidepanel_wrapper.className = "bam-side-panel";
        // dom_content.appendChild(this.dom_languagepicker);
        dom_content.appendChild(this.dom_languagepicker);
        dom_content.appendChild(this.dom_modelpicker);
        dom_content.appendChild(this.dom_projectmanager);
        // dom_content.appendChild(projectmanager_list);
        this.dom_sidepanel_wrapper.appendChild(dom_collapsebtn);
        this.dom_sidepanel_wrapper.appendChild(dom_content);
        // this.dom_sidepanel_wrapper.appendChild(projectmanager_list);
    }

    disableModelPicker() {
        this.dom_modelpicker.querySelector("#title").setAttribute("disabled", "");
        let content = this.dom_modelpicker.querySelector("#content");
        for (let opt of content.children) {
            opt.disabled = true;
        }
    }
    enableModelPicker() {
        this.dom_modelpicker.querySelector("#title").removeAttribute("disabled");
        let content = this.dom_modelpicker.querySelector("#content");
        for (let opt of content.children) {
            opt.disabled = false;
        }
    }

    // **********************************************************
    // when a model is picked or when one wants to reset the project
    // this function is called whenever modelID changes
    // FIXME: might be smarter to make specific call to this function when needed
    set modelID(modelid) {
        console.log("this.modelID is now '" + modelid + "'");
        if (modelid === "TextFile") {
            this.md = new bamXtraTextFile();
            this.md.setParent(this.dom_mainpanel_wrapper);
            this.disableModelPicker();
        } else if (modelid === "RESET") {
            let self = this;
            new bamMessage(_I("reset_warning_question", "msg"), {
                type: "warning",
                question: function() { self.resetProject() }
            })
        } else {
            console.log("this.modelID is now '" + this.modelID + "'");
            console.log("this.modelID is now '" + modelid + "'");
        }

        // add callback to model definition UI object
        if (this.md) {
            let self = this;
            this.md.onValidationCallback = function(modelid, xtra, parameters, inputs, outputs) {
                let MD = {
                    modelid: modelid,
                    xtra: xtra,
                    parameters: parameters,
                    inputs: inputs,
                    outputs, outputs
                }
                // Shiny.setInputValue("on_modeldefinition_validation", MD)
                Shiny.onInputChange("on_modeldefinition_validation", MD)
                Shiny.addCustomMessageHandler("on_modeldefinition_validation", function(data) {
                    console.log(data);
                    if (data) {
                        self.BaM_Config.MD = MD;
                    }
                })
            }
        }
    }

    resetProject() {
        this.BaM_Config = {};
        this.modelID = null;
        this.md = null;
        this.pd = null;
        this.cd = null;
        this.rb = null;
        this.dom_mainpanel_wrapper.innerHTML = "";
        this.dom_projectmanager.querySelector("#bam-shinierbam-project-name").value = "";
        this.enableModelPicker();
    }

    loadProject() {
        console.log("load project")
        // new bamMessage(_I("loadingproject_question", "msg"), {
        //     type: "warning", 
        //     question: function() {
        //         let e = document.createElement("input");
        //         e.type = "file";
        //         e.display = "none";
        //         e.accept = "application/json";
        //         e.click();
        //         e.addEventListener("change", function(e) {
        //             let files = e.target.files;
        //             if (files.length) {
        //                     let f = files[0];
        //                     let fn = f.name.replace(/\.[^/.]+$/, ""); // remove file extension
        //                     console.log(f.name)
        //                     console.log(fn)
        //                     let r = new FileReader();
        //                     r.onload = function(e) {
        //                         try {
        //                             console.log(e);
        //                             let p = JSON.parse(e.target.result)
        //                             p.projectname = fn;
        //                             if (fn === "shinierBaMproject")  p.projectname = "";
        //                             self.loadProject(p);
        //                         } catch (err) {
        //                             new bamMessage(_I("loadingproject_error", "msg"), {type: "error"})
        //                         }
        //                     };
        //                 try {
        //                     r.readAsText(f);
        //                 } catch (err) {
        //                     new bamMessage(_I("loadingproject_error", "msg"), {type: "error"})
        //                 }
        //             }
        //         })
        //     }
        // })
    }
    // loadProject(project) {
    //     console.log(project);
    //     if (project.MD) {
    //         this.resetProject();
    //         console.log(project.projectname);
    //         console.log(this.dom_projectmanager.querySelector("#bam-shinierbam-project-name"));
    //         this.dom_projectmanager.querySelector("#bam-shinierbam-project-name").value = project.projectname;
    //         if (project.MD.modelid == "TextFile") {
    //             this.md = new bamXtraTextFile();
    //             this.md.setParent(this.dom_mainpanel_wrapper);
    //             this.md.set(project.MD);
    //             this.BaM_Config = project;
    //             this.disableModelPicker();
    //         }
    //     } else {
    //         new bamMessage("The loaded project appears to be empty", {type: "warning"})
    //     }
    // }

    createNewBaMproject(id) {
        let self = this;
        new bamMessage(_I("ask_project_name"), {
            type: "info",
            input: _I("project_name"),
            question: function(value) {
                console.log(value)
                let b = new bamProject(value, id);
                // **************************************************
                // action when the preview is clicked --> set as current project
                b.setCallback("onSelectCallback", function() {
                    self.dom_mainpanel_wrapper.innerHTML = "";
                    self.dom_mainpanel_wrapper.appendChild(b.getDOM());
                    _IupdateDOMtext();
                    for (let a of self.bam_projects) {
                        a.setState(false);
                    }
                    b.setState(true);
                })
                // **************************************************
                // action when user click the delete button
                b.setCallback("onDeleteCallback", function() {
                    new bamMessage(_I("ask_delete_project"), {type: "warning", question: function() {
                        let i = self.bam_projects.indexOf(b);
                        self.bam_projects.splice(i, 1);
                        b.destroyDOM()
                    }})
                })
                // **************************************************
                // set as current project
                for (let a of self.bam_projects) {
                    a.setState(false);
                }
                b.setState(true);
                self.dom_mainpanel_wrapper.innerHTML = "";
                self.dom_mainpanel_wrapper.appendChild(b.getDOM());
                self.bam_projects.push(b);
                self.dom_projectmanager.querySelector("#bam-projectmanager-list").prepend(b.getDOMpreview())
            }})
    }
}



