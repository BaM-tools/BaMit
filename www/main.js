// this is to have a confirmation message before closing the tab/browser or goind somewhere else
// source: https://stackoverflow.com/a/19538231
// window.addEventListener("beforeunload", function (e) {
//     var confirmationMessage = "\o/";
//     (e || window.event).returnValue = confirmationMessage; //Gecko + IE
//     return confirmationMessage;                            //Webkit, Safari, Chrome
// });
// CURRENT PROJECT NAME (so it is accessible everywhere) // FIXME: not an ideal solution, but works well
let PROJECT_NAME

// Object containing all distribution and all possible BaM model
// (Result in R from RBaM::getCatalogue())
var BaMCatalogue;

// An array containing the BaM model currently implemented here
const BaMImplementedModel = ["TextFile"]

// An object containing the available language and
// the file name of the image for the language picker
const LANGUAGES = {
    en: {name: "English", image: "united-kingdom-flag-square-xs.png"},
    fr: {name: "Français", image: "france-flag-square-xs.png"}
}

// Variable containing the current BaMProject
var BaMProject; 

// handle the steps necessary before loading the App ...
const loadingState = {bami: false, dom_content: false, server: false}
document.addEventListener("LoadingState", function(e) {
    console.log("... '" + e.detail + "' ready ...");
    loadingState[e.detail] = true;
    let isAppReady = true;
    for (let key in loadingState) {
        if (!loadingState[key]) isAppReady = false
    }
    if (isAppReady) {
        loadApp();
    }
})
// ... when the document is loaded
document.addEventListener("DOMContentLoaded", function() {
    document.dispatchEvent(new CustomEvent("LoadingState", {detail: "dom_content"}));
    // initialize the internationalization module
    bamI.initFromCSV([
        "./internationalization/txtUI.csv",
        "./internationalization/txtMSG.csv",
        "./internationalization/txtRBaM.csv"],
        function() {
            document.dispatchEvent(new CustomEvent("LoadingState", {detail: "bami"}));
        }
    )
    // set the default d3 local parameters
    d3.formatDefaultLocale({
        decimal: ".",
        thousands: "",
        grouping: [3],
        currency: ["", "€"]
    })
})
// ... when the session in Shiny (server side) is initiated
Shiny.addCustomMessageHandler("shinier_bam_data", function(data) {
    BaMCatalogue = data;
    for (let p in BaMCatalogue.parameters) {
        BaMCatalogue.parameters[p] = bamProcessArrayFromR(BaMCatalogue.parameters[p])
    }
    document.dispatchEvent(new CustomEvent("LoadingState", {detail: "server"}));
})


// load the app
function loadApp() {
    console.log(" ********* App Start *********** ")

    // **************************************************************
    // **************************************************************
    // App header
    const dom_header = document.createElement("div");
    document.body.append(dom_header);
    dom_header.id = "bam-main-header";

    // **************************************************************
    // ShinieRBaM logo
    const dom_logo = document.createElement("img");
    dom_header.append(dom_logo);
    dom_logo.id = "bam-main-logo"
    dom_logo.src = "./images/logo.png"
    
    // **************************************************************
    // Action buttons
    const dom_actions = document.createElement("div");
    dom_header.append(dom_actions);
    dom_actions.id = "bam-main-actions";
    // new project
    const dom_newproject = buildNewModelMenue(); // see below
    dom_actions.append(dom_newproject);
    // import project
    const dom_importroject_hidden = document.createElement("input");
    dom_importroject_hidden.type = "file";
    dom_importroject_hidden.accept = ".bam";
    dom_importroject_hidden.addEventListener("change", function() {
        const f = this.files[0];
        if (f.size < 10000000 ) { // 10Mo max
            loadBaMproject(f);
        } else {
            new bamMessage({
                message: bamI.getText("import_project_toobig"),
                type: "error",
                timeout: 5000 
            });
        }
    });
    const dom_importroject = document.createElement("button");
    bamI.set(dom_importroject).key("import_project").text().apply();
    dom_importroject.addEventListener("click", function() {
        if (BaMProject) {
            new bamMessage({
                type: "warning",
                message: bamI.getText("warning_project_loss"),
                question: true,
                yes: function() {
                    dom_importroject_hidden.click()
                }
            })
        } else {
            dom_importroject_hidden.click()
        }
    })
    dom_actions.append(dom_importroject);

    // **************************************************************
    // Help / Getting started & Language picker

    const dom_options = document.createElement("div");
    dom_header.append(dom_options);
    dom_options.id = "bam-main-options";
    const dom_get_started = document.createElement("button");
    dom_get_started.className = "bam-btn-simple";
    bamI.set(dom_get_started).key("help_button").text().apply();
    // dom_get_started.textContent = "Getting started";
    const help = new bamHelp();
    dom_get_started.addEventListener("click", function() {
        console.log("Clicked!")
        help.show(bamI.getLanguage());
    })
    dom_options.appendChild(dom_get_started);
    for (let l in LANGUAGES) {
        let i = document.createElement("img")
        i.src = "./images/" + LANGUAGES[l].image;
        i.addEventListener("click", function() {
            bamI.setLanguage(l).update();
        })
        dom_options.appendChild(i);
    }

    // **************************************************************
    // **************************************************************
    // App content
    const dom_content = document.createElement("div");
    document.body.append(dom_content);
    dom_content.id = "bam-main-content";

    help.setParent(dom_content);

    // **************************************************************
    // **************************************************************
    // for debugging

    // const bam_results = new bamResults();
    // bam_results.setParent(dom_content);

    // const bam_remnant = new bamRemnantErrorModel();
    // bam_remnant.setParent(dom_content);
    // bam_remnant.update(["Y1", "Y2"]);

    // const bam_prediction = new bamPrediction();
    // bam_prediction.setParent(dom_content);
    // bam_prediction.update(["P1", "P2"]);
}

// build the NewModel menue
function buildNewModelMenue() {
    const dom_newmodel = document.createElement("button");
    bamI.set(dom_newmodel).key("new_project").text().apply();

    const dom_modelpicker = document.createElement("div");
    document.body.append(dom_modelpicker);
    dom_modelpicker.id = "bam-main-actions-modelpicker";
    dom_modelpicker.setAttribute("hidden", "");

    for (let k = 0; k < BaMCatalogue.models.length; k++) {
        const dom_onemodel = document.createElement("button");
        dom_modelpicker.append(dom_onemodel);
        dom_onemodel.textContent = BaMCatalogue.models[k];
        dom_onemodel.addEventListener("click", function(e) {
            e.stopPropagation()
            dom_modelpicker.toggleAttribute("hidden");
            dom_newmodel.toggleAttribute("opened");
            newBaMproject(this.textContent);
        })
    }

    dom_newmodel.addEventListener("click", function(e) {
        e.stopPropagation()
        dom_modelpicker.toggleAttribute("hidden");
        this.toggleAttribute("opened");
    });

    document.addEventListener("click", function() {
        dom_modelpicker.setAttribute("hidden", "");
        dom_newmodel.removeAttribute("opened");
    })

    return dom_newmodel;
}

// function that creates a new BaM Project and handle warning in case
// a project is already loaded
function newBaMproject(ID) {
    if (BaMImplementedModel.indexOf(ID) != -1) {
        projectNameInputCallback = function(value) {
            BaMProject = new bamProject();
            BaMProject.set({name: value, modelid: ID})
            let content = document.querySelector("#bam-main-content");
            content.innerHTML = "";
            content.append(BaMProject.getDOM());
            BaMProject.onDeleteCallback = function() {
                content.innerHTML = "";
                BaMProject = null
            }
        }
        let content = document.querySelector("#bam-main-content");   
        if (BaMProject) {
            new bamMessage({
                type: "warning",
                message: bamI.getText("warning_project_loss"),
                question: true,
                yes: function() {
                    content.innerHTML = "";
                    askForProjectNameInput(projectNameInputCallback)
                }
            })
        } else {
            content.innerHTML = "";
            askForProjectNameInput(projectNameInputCallback)
        }
            
    } else {
        new bamMessage({
            message: bamI.getText("not_implemented"),
            type: "warning"
        })
    }
}

// function that handles load/import of an existing BaM project
function loadBaMproject(f) {
    const fr = new FileReader();

    fr.onload = function(e) {
        let config;
        try {
            config = JSON.parse(e.target.result);
        } catch (error) {
            new bamMessage({
                message: bamI.getText("import_project_parseerror"),
                type: "error",
                timeout: 5000
            })
            return;
        }
        BaMProject = new bamProject(config.name, config.modelid);
        let content = document.querySelector("#bam-main-content");
        content.innerHTML = "";
        content.append(BaMProject.getDOM());
        BaMProject.set(config);
        BaMProject.onDeleteCallback = function() {
            content.innerHTML = "";
            BaMProject = null;
        }
    }

    fr.readAsText(f);
}

