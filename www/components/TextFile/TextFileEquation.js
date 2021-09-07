/**
 * @description
 * A class representing an equation used in the specification of a TextFile model.
 * For one equation we have (1) an input field for output name, (2) an input field for the equation
 * and (3) a button to delete the equation.
 * An equation is also attributed an id.
 * 
 * @argument eq_id the equation id to recognize it among other equations
 * 
 * @author Ivan Horner
 * 
 */
class TextFileEquation {
    constructor(eq_id) {

        // **********************************************************
        // Equation output name / label
        const output_name = "Y" + eq_id;
        const dom_eq_output = document.createElement("input");
        dom_eq_output.id = "output";
        dom_eq_output.value = output_name;
        dom_eq_output.placeholder = output_name;
        dom_eq_output.style.textAlign = "right";
        dom_eq_output.onkeypress = function(e) {
            if (!/[a-zA-Z0-9_\.]/.test(e.key)) {
                new bamMessage({
                    message: bamI.getText("textfile_eqname_invalidchar"),
                    type: "error",
                });
                return false;
            }
            // this is not sufficient since the user can delete character
            // and an invalid output name resulting from the deletion
            if (/[0-9_\.]/.test(e.key)) { 
                if (this.selectionStart === 0) {
                    new bamMessage({
                        message: bamI.getText("textfile_eqname_startchar"),
                        type: "error",
                    });
                    return false;
                }
            }
            return true;
        }
        dom_eq_output.addEventListener("input", (e) => {
            this.onChangeCallback();
        })

        // **********************************************************
        // Equal character between output and actual equation
        const dom_equal = document.createElement("div");
        dom_equal.textContent = " = ";

        // **********************************************************
        // Equation / Formula
        const dom_eq = document.createElement("input");
        dom_eq.id = "equation";
        dom_eq.placeholder = "Eq. #" + eq_id;
        dom_eq.onkeypress = function(e) {
            if( !/[a-zA-Z0-9-\^\*\+\(\)\.\/]/.test(e.key)) {
                new bamMessage({
                    message: bamI.getText("textfile_eqform_invalidchar"),
                    type: "error"
                });
                return false;
            }
            return true;
        }
        dom_eq.addEventListener("input", (e) => {
            this.onChangeCallback();
        })

        // **********************************************************
        // Button to delete the equation / formula
        const dom_del_btn = document.createElement("button");
        dom_del_btn.id = "delete";
        dom_del_btn.textContent = "-";
        dom_del_btn.addEventListener("click", () => {
            this.destroy();
        })

        // **********************************************************
        // Wrapper
        this.dom_wrapper = document.createElement("div");
        this.dom_wrapper.className = "bam-textfile-equation";
        this.dom_wrapper.appendChild(dom_eq_output);
        this.dom_wrapper.appendChild(dom_equal);
        this.dom_wrapper.appendChild(dom_eq);
        this.dom_wrapper.appendChild(dom_del_btn);

        // **********************************************************
        // default to unvalid equation
        this.setValidity(false);
    }
    setFocus() {
        let e = this.dom_wrapper.querySelector("#equation")
        setTimeout(function() {
            e.focus();
        }, 0)
    }
    setParent(parent) {
        parent.appendChild(this.dom_wrapper);
    }
    destroy() {
        this.dom_wrapper.remove();
        this.onDestroyCallback()
    }
    setValidity(isValid) {
        if (isValid) {
            this.dom_wrapper.querySelector("#equation").removeAttribute("nonvalid")
        } else {
            this.dom_wrapper.querySelector("#equation").setAttribute("nonvalid", "")
        }
    }
    get() {
        return {
            equation: this.dom_wrapper.querySelector("#equation").value,
            defined_name: this.dom_wrapper.querySelector("#output").value,
            default_name: this.dom_wrapper.querySelector("#output").placeholder
        }
    }
    set(config) {
        this.dom_wrapper.querySelector("#output").value = config.defined_name;
        this.dom_wrapper.querySelector("#output").placeholder = config.default_name;
        this.dom_wrapper.querySelector("#equation").value = config.equation;
    }
}