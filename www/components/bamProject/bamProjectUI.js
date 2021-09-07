class bamProjectUI {
    constructor() {

        
        this.dom_panel = document.createElement("div");
        this.dom_panel.className = "bam-project-panel";
        this.buildPanel()

        this.dom_components = document.createElement("div");
        this.dom_components.className = "bam-project-components";

        this.components = [];
        this.maximized = false; // navigation type

    }

    setParent(parent) {
        parent.append(this.dom_panel);
        parent.append(this.dom_components);
    }

    scrollToEnd() {
        this.dom_components.scrollTo({
            top: this.components[this.components.length - 1].getTopLocation(),
            behavior: "smooth"
        })
    }

    scrollToComponent(component) {
        this.dom_components.scrollTo({
            top: component.getTopLocation(),
            behavior: "smooth"
        })
    }

    clearComponents() {
        this.dom_components.innerHTML = "";
        this.dom_navigation_items.innerHTML = "";
        this.components = [];
    }

    deleteComponent(component) {
        const k = this.components.indexOf(component);
        if (k !== -1) {
            this.dom_components.removeChild(this.dom_components.childNodes[k])
            this.dom_navigation_items.removeChild(this.dom_navigation_items.childNodes[k])
            this.components.splice(k, 1);
        } else {
            throw "deleteComponent: this should not happend if I call this function correctly"
        }
    }

    addComponent(component) {
        component.setParent(this.dom_components)
        component.onMaximizedCallback = () => {
            if (component.maximized) {
                this.maximized = true;
                component.hidden = false;
                for (let c of this.components) {
                    if (c != component) {
                        c.hidden = true;
                    }
                }
            } else {
                this.maximized = false;
                for (let c of this.components) {
                    c.hidden = false;
                }
                this.scrollToComponent(component)
                // this.dom_components.scrollTo({
                //     top: component.getTopLocation(),
                //     behavior: "smooth"
                // })
            }
        }
        const dom_nav = document.createElement("div")
        dom_nav.classList.add("clickable");
        dom_nav.classList.add("clickable-navigation");
        component.addExternalNamedItem(dom_nav);
        // bamI.set(dom_nav).key(component.title_key).text().apply();
        dom_nav.addEventListener("click", () => {
            if (this.maximized) {
                for (let c of this.components) {
                    c.maximized = false;
                }
                component.maximized = true;
            } else {
                // this.dom_components.scrollTo({
                //     top: component.getTopLocation(),
                //     behavior: "smooth"
                // })
                this.scrollToComponent(component)
                // this.dom_components.scrollTo(0, component.getTopLocation())
            }
        })
        this.components.push(component);
        this.dom_navigation_items.append(dom_nav);
    }

    setModelName(name) {
        this.name = name;
        this.dom_panel.querySelector("#name").textContent = ": " + name;
    }
    setModelType(modelid) {    
        this.modelid = modelid;    
        this.dom_panel.querySelector("#modelid").textContent = ": " + modelid;
    }

    buildPanel() {
        // **********************************************************
        // project info
        const dom_projinfo = document.createElement("div");
        dom_projinfo.classList.add("space-sides")
        this.dom_panel.append(dom_projinfo);

        // name
        const dom_projname = document.createElement("div");
        const d_pn_1 = document.createElement("span");
        d_pn_1.classList.add("emphasize");
        // d_pn_1.style.fontWeight = "bold";
        bamI.set(d_pn_1).key("project_name").text().apply();
        const d_pn_2 = document.createElement("span");
        d_pn_2.id = "name"
        dom_projname.append(d_pn_1);
        dom_projname.append(d_pn_2);
        dom_projinfo.append(dom_projname);

        // type
        const dom_projtype = document.createElement("div");
        const d_pt_1 = document.createElement("span");
        d_pt_1.classList.add("emphasize");
        // d_pt_1.style.fontWeight = "bold";
        bamI.set(d_pt_1).key("model_type").text().apply();
        const d_pt_2 = document.createElement("span");
        d_pt_2.id = "modelid"
        dom_projtype.appendChild(d_pt_1);
        dom_projtype.appendChild(d_pt_2);
        dom_projinfo.append(dom_projtype)

        // **********************************************************
        // project actions
        const dom_actions = document.createElement("div");
        dom_actions.classList.add("space-above")
        dom_actions.classList.add("project-actions")
        this.dom_panel.append(dom_actions);
        
        // button export
        const dom_savebtn = document.createElement("button");
        dom_savebtn.classList.add("bam-btn-simple");
        bamI.set(dom_savebtn).key("export_project").text().apply();
        dom_savebtn.addEventListener("click", () => this.onSaveCallback())
        dom_actions.append(dom_savebtn)

        // button reset
        const dom_resetbtn = document.createElement("button");
        dom_resetbtn.classList.add("bam-btn-simple");
        bamI.set(dom_resetbtn).key("reset_project").text().apply();
        dom_resetbtn.addEventListener("click", () => this.onResetCallback())
        dom_actions.append(dom_resetbtn)

        // button delete
        const dom_deletebtn = document.createElement("button");
        dom_deletebtn.classList.add("bam-btn-simple");
        bamI.set(dom_deletebtn).key("delete_project").text().apply();
        dom_deletebtn.addEventListener("click", () => this.onDeleteCallback())
        dom_actions.append(dom_deletebtn)

        // button rename
        const dom_renamebtn = document.createElement("button");
        dom_renamebtn.classList.add("bam-btn-simple");
        bamI.set(dom_renamebtn).key("rename_project").text().apply();
        // dom_renamebtn.addEventListener("click", () => this.onRenameCallback())
        dom_renamebtn.addEventListener("click", (e) => { 
            
            // e.stopPropagation();
            askForProjectNameInput(
                (value) => {
                    this.onRenameCallback(value)
                    d_pn_2.textContent = " : " + value;
                },
                this.name
            )
         });
         dom_actions.append(dom_renamebtn)


        // **********************************************************
        // Project content navigation bar
        const dom_navigation = document.createElement("div");
        dom_navigation.classList.add("space-above")
        this.dom_panel.append(dom_navigation);

        // title
        const dom_navigation_title = document.createElement("div");
        dom_navigation_title.classList.add("emphasize");
        dom_navigation_title.classList.add("space-sides");
        bamI.set(dom_navigation_title).key("project_content").text().apply();
        dom_navigation.append(dom_navigation_title);

        // navigation items
        this.dom_navigation_items = document.createElement("div");
        this.dom_navigation_items.id = "navigation-items"
        dom_navigation.append(this.dom_navigation_items);
    }
}