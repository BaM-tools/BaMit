/**
 * @description
 * A BaM Equations list class used for the specification of a TextFile model.
 * It stores equations (bamEquation object) and manages the following:
 * (1) addition / deletetion of equations
 * (2) any change in one of the equation by triggering a call to Shiny server to parse 
 *     the equations in order to check their validity and retrieve the parameters (or inputs)
 * 
 * @author Ivan Horner
 */
class TextFileEquations {
    constructor() {

        this.dom_wrapper = document.createElement("div");
        this.dom_wrapper.className = "bam-textfile-equations";

        // Array of TextFileEquation objects
        this.textFileEquations = [];

        // Object containing variables (i.e. un-identified parameters/inputs)
        this.variables = {}; 

        // setTimeout object used to limit request load on server when equations change
        this.timeout = null; 

        // **********************************************************
        // Receive processed equations and retrieved variables (i.e. parameters or inputs of the equations) from R server
        Shiny.addCustomMessageHandler("textfile_equation_changed", (data) => {
            if(!data.variables) data.variables = []
            data.variables = bamProcessArrayFromR(data.variables)
            data.valid = bamProcessArrayFromR(data.valid)
            for (let k = 0; k < data.valid.length; k++) {
                if (this.textFileEquations[k]) this.textFileEquations[k].setValidity(data.valid[k])
            }
            this.variables = {};
            for (let k = 0; k < data.variables.length; k++) {
                this.variables[data.variables[k]] = "u";
            }
            this.onChangeCallback(this.variables);
        })
    }

    setParent(parent) {
        parent.appendChild(this.dom_wrapper);
    }

    addEquation() {
        let index = 0;
        while(this.textFileEquations[index]) {
            index++;
        }
        this.textFileEquations[index] = new TextFileEquation(index + 1);
        this.textFileEquations[index].setParent(this.dom_wrapper);
        this.textFileEquations[index].setFocus(); // set the focus to the new equation
        this.textFileEquations[index].onDestroyCallback = () => {
            this.textFileEquations[index] = undefined;
            this.onChange();
        };
        this.textFileEquations[index].onChangeCallback = () => {
            this.onChangeCallback(); // with no arguments
            this.onChange();
        }
    }

    onChange() {
        // this.onChange();
        // the use of setTimeout is intended to limit the request load on the server
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.timeout = setTimeout(() => {
            let eqs = [];
            for (let k = 0; k < this.textFileEquations.length; k++) {
                if (this.textFileEquations[k]) {
                    eqs.push(this.textFileEquations[k].get().equation);
                } else {
                    eqs.push("");
                }
            }
            // Shiny.setInputValue("textfile_equation_changed", {eq: eqs, r: Math.random()});
            Shiny.onInputChange("textfile_equation_changed", {eq: eqs, r: Math.random()});
        }, 500)
    }

    get() {
        const equations = [];
        for (let k = 0; k < this.textFileEquations.length; k++) {
            if (this.textFileEquations[k] !== undefined) {
                equations.push(this.textFileEquations[k].get())
            }
            
        }
        return equations;
    }
    set(config) {
        for (let k = 0; k < this.textFileEquations.length; k++) {
            if (this.textFileEquations[k]) {
                this.textFileEquations[k].destroy();
            }
        }
        this.textFileEquations = [];
        for (let k = 0; k < config.length; k++) {
                this.addEquation();
                this.textFileEquations[k].set(config[k]);
        }
        this.onChange();
    }
}