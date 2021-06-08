/**
 * @description
 * A BaM inputs/parameters identification object used in the specification of 
 * a TextFile model.
 * Its purpose is to display the parameters identified in the equations specified by the user
 * and make it possible, for the user, to identify which of the equation parameters are actually
 * equation inputs.
 * There are two columns, a parameter and a input columns. 
 * When a parameter (listed in the parameter column) is clicked, it changes category and 
 * becomes an input variable (listed on the input column); the opposit is also true when one
 * clicks an input variable. Note that in the terminology used in this class a "variable" can be 
 * either a parameter or an input wherease a "parameter" is a parameter and "input" in an input.
 * 
 * @author Ivan Horner
 * 
 */
class TextFileInputsParameters {
    constructor() {

        // **********************************************************
        // parameters side
        this.dom_parameterside = document.createElement("div");
        this.dom_parameterside.id = "parameters";
        const textdiv_p = document.createElement("div")
        textdiv_p.id = "variable-column-title";
        bamI.set(textdiv_p).key("variable_parameters").text().apply();
        this.dom_parameterside.appendChild(textdiv_p);

        // **********************************************************
        // inputs side
        this.dom_inputside = document.createElement("div");
        this.dom_inputside.id = "inputs";
        const textdiv_i = document.createElement("div")
        textdiv_i.id = "variable-column-title";
        bamI.set(textdiv_i).key("variable_inputs").text().apply();
        this.dom_inputside.appendChild(textdiv_i);

        // **********************************************************
        // Wrapper
        this.dom_wrapper = document.createElement("div")
        this.dom_wrapper.className = "bam-textfile-inputsparameters"
        this.dom_wrapper.appendChild(this.dom_parameterside);
        this.dom_wrapper.appendChild(this.dom_inputside);

        // **********************************************************
        this.variables = {}     // Will contains the inputs and parameters
    }

    setParent(parent) {
        parent.appendChild(this.dom_wrapper)
    }
    
    setVariableType(v, type) {
        if (this.variables[v]) {
            if (type === "u") type = "p";
            if (this.variables[v].type !== type) {
                this.variables[v].type = type;
                if (type === "p") {
                    this.dom_parameterside.append(this.variables[v].dom);
                } else {
                    this.dom_inputside.append(this.variables[v].dom);
                }
            }
        }
    }
    getBaMconfig() {
        const inputs = [];
        for (let v in this.variables) {
            if (this.variables[v].type === "i") {
                inputs.push(v)
            }
        }
        return inputs;
    }
    get() {
        const config = {};
        for (let v in this.variables) {
            config[v] = this.variables[v].type;
        }
        return config;
    }
    set(config) {
        for (let v in config) {
            if (!this.variables[v]) {
                let self = this;
                const dom_variable = document.createElement("button");
                dom_variable.textContent = v;
                dom_variable.addEventListener("click", function() {
                    let type = self.variables[v].type;
                    if (type === "p") {
                        type = "i";
                    } else {
                        type = "p";
                    }
                    self.setVariableType(v, type);
                    self.onChangeCallback();
                });
                this.variables[v] = {
                    type: "u",
                    dom:  dom_variable
                }
                this.setVariableType(v, config[v])
                
            } else {
                if (config[v] !== "u") {
                    this.setVariableType(v, config[v])
                }
            }
        }   
        for (let v in this.variables) {
            if (!config[v]) {
                this.variables[v].dom.remove();
                delete this.variables[v]
            }
        }
        this.onChangeCallback();
    }

}