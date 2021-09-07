/**
 * @description
 * BaM TextFile specification component extending a BaM Xtra component.
 * This class is used for the specification of a TextFile model. 
 * It includes two panels/sides: (1) an equation specification panel/side and a parameters/inputs
 * identification panel/side.
 * The equation side includes a list of equations (only one by default) that can be added or 
 * deleted with the equation output that is also editable.
 * The parameters/inputs identification side includes a two sides list with the 
 * parameters (by default all "elements" in the equation are parameters) on the left, and 
 * the inputs on the right; by clicking the inputs/parameters you can swap their category.
 * 
 * @author Ivan Horner
 */
class bamXtraTextFile extends bamXtra {
    constructor() {
        super();

        // key used by bamI to set the title of component
        this.title_key = "xtra_textfile_title"; 
        // for callbacks
       
        // **********************************************************
        // main content wrapper
        const dom_maincontent = document.createElement("div");
        dom_maincontent.className = "bam-xtra-textfile";
        this.dom_content_top.append(dom_maincontent)

        // **********************************************************
        // Equations side
        const dom_equations = document.createElement("div");
        dom_equations.id = "equations";
    
        // header
        const dom_equations_title = document.createElement("div");
        dom_equations_title.id = "equations-title"
        bamI.set(dom_equations_title).key("textfile_eq_header").text().apply();
        dom_equations.appendChild(dom_equations_title);

        // textFileEquations object:
        this.textfile_equations = new TextFileEquations()
        this.textfile_equations.onChangeCallback = (variables=null) => {
            // when the equation (or output name) changes, update inputsparameters object
            if (variables) this.textfile_inputsparameters.set(variables);
            this.onChange();
        }
        this.textfile_equations.setParent(dom_equations)

        // add equation button
        const dom_equations_add = document.createElement("button");
        bamI.set(dom_equations_add).key("textfile_addeq").text().apply();
        dom_equations_add.addEventListener("click", () => {
            this.textfile_equations.addEquation();
        })
        dom_equations.appendChild(dom_equations_add);
        
        // **********************************************************
        // Parameter / input side
        const dom_inputsparameters = document.createElement("div");
        dom_inputsparameters.id = "inputsparameters";

        // header
        const dom_inputsparameters_title = document.createElement("div");
        dom_inputsparameters_title.id = "inputsparameters-title";
        bamI.set(dom_inputsparameters_title).key("textfile_ip_header").text().apply();
        dom_inputsparameters.appendChild(dom_inputsparameters_title);

        // help
        const dom_inputsparameters_help = document.createElement("div");
        dom_inputsparameters_help.id = "inputsparameters-help";
        bamI.set(dom_inputsparameters_help).key("textfile_ip_header_help").text().apply();
        dom_inputsparameters.appendChild(dom_inputsparameters_help);

        // inputsparameters idendification object
        this.textfile_inputsparameters = new TextFileInputsParameters();
        this.textfile_inputsparameters.onChangeCallback = () => {
            this.onChange();
        }
        this.textfile_inputsparameters.setParent(dom_inputsparameters);

        // **********************************************************
        // content DOM
        dom_maincontent.appendChild(dom_equations);
        dom_maincontent.appendChild(dom_inputsparameters);

        // **********************************************************
        // action when model is validated
        this.dom_apply_button.addEventListener("click", () => {
            const config = this.get();
            this.setConfig(config);
            this.onValidationCallback(config);

        });

        // **********************************************************
        // properties
        // this.validated = false;
        // this.validatedConfig = null;
        this.textfile_equations.addEquation(); // has one equation by default
        this.onChange();
    }

    onChange() { 
        const config = this.get();
        this.errorMessagesManagement(config.textfile);
        this.checkConfigOutdating();

    }

    // **************************************************************
    errorMessagesManagement(config) {
        let hasError = false;
        this.clearMessages("error");
        let n_eqs = 0;
        for (let e of config.equations) {
            if (e !== undefined) {
                if (!isNaN(parseInt(e.defined_name))) {
                    this.addThreePartsErrorMessage("textfile_outputname", config.equations.indexOf(e)+1, "textfile_outputnameinvalid")
                    hasError = true;
                }
                if (e.equation != "") {
                    n_eqs++;
                }
            }
            
        }
        if (n_eqs === 0) {
            this.addMessage("textfile_atleaseoneeq", "textfile_atleaseoneeq", "error")
            hasError = true;
        } 
        // else {
        //     this.removeMessage("textfile_atleaseoneeq");
        // }
        let n_inputs = 0;
        let n_params = 0;
        for (let v in config.variables) {
            if (config.variables[v] === "i") {
                n_inputs++;
            }
            if (config.variables[v] === "p") {
                n_params++;
            }
        }
        if (n_params === 0) {
            this.addMessage("textfile_atleaseonepar", "textfile_atleaseonepar", "error")
            hasError = true;
        } 
        // else {
        //     this.removeMessage("textfile_atleaseonepar");
        // }
        if (n_inputs === 0) {
            this.addMessage("textfile_atleaseoneinput", "textfile_atleaseoneinput", "error")
            hasError = true;
        }
        // else {
        //     this.removeMessage("textfile_atleaseoneinput");
        // }
        // finally, disable/enable apply button + isvalid property
        if (!hasError) {
            this.dom_apply_button.disabled = false;
            this.isvalid = true;
        } else {
            this.dom_apply_button.disabled = true;
            this.isvalid = false;
        }
    }

    // **************************************************************
    getBaMconfig() {
        const config = {id:"TextFile", nX: 0, nY: 0, xtra: {inputs: [], formulas: []}};
        const uptodate_config = this.getConfig(); 
        config.xtra.inputs = Object.keys(uptodate_config.inputs);
        for (let e of uptodate_config.textfile.equations) {
            if (e.equation !== "") {
                config.xtra.formulas.push(e.equation);
            }
        }
        config.nX = config.xtra.inputs.length;
        config.nY = config.xtra.formulas.length;
        return config;
    }
    /**
     * @description get xtra config object
     * @returns xtra config object
     */
    get() {
        const equations = this.textfile_equations.get();
        const variables = this.textfile_inputsparameters.get();
        const parameters = {};
        const inputs     = {};
        const outputs    = {};
        for (let v in variables) {
            if (variables[v] === "p") {
                parameters[v] = {name: v};
            } else {
                inputs[v]     = {name: v};
            }
        }
        for (let e of equations) {
            if (e.equation != "") {
                let name = e.defined_name;
                if (name === "") {
                    name = e.default_name;
                }
                outputs[name] = {name: name}           
            }
        }
        return {
            textfile: {
                equations: equations,
                variables: variables
            },
            parameters: parameters,
            inputs: inputs,
            outputs: outputs,
        };
    }
    set(config) {
        this.textfile_equations.set(config.textfile.equations);
        this.textfile_inputsparameters.set(config.textfile.variables);
    }

}
