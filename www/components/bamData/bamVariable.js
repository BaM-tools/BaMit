/**
 * @description
 * A class that manages the mapping between datasets and a variable, i.e. an input or output variable.
 * It manages the mapping of the value of the variable as well as the mapping for uncertainty vectors: U, B and B.index.
 * It manages the available mapping options and check if a variable is valid, i.e. if the variable values vector has a 
 * mapping option specified (i.e. if a dataset and a column has been specified for the variable values).
 * 
 * @argument name name of the variable
 * 
 * @author Ivan Horner
 * 
 * @todo Is this component generic enough to be used for prediction as well? If yes, might need to be moved elsewhere!
 */
class bamVariable {
    constructor(u=true, b=true) {

        const any_u = u || b;
        // any_u => need a button
        // u     => non-systematic errors
        // b     => systematic errors (b + b.index)

        let self = this; // for callbacks

        // variable name
        // this.name = name;

        // current mapping options
        this.options = [];

        // main wrapper
        this.dom_wrapper = document.createElement("div");
        this.dom_wrapper.className = "bam-variable";

        // variable name
        const dom_name = document.createElement("div")
        dom_name.id = "name";
        // dom_name.textContent = name;
        this.dom_wrapper.append(dom_name);

        // variable values panel
        const dom_values_panel = document.createElement("div");
        dom_values_panel.id = "values-panel";
        this.dom_wrapper.append(dom_values_panel);

        // button to toggle uncertainty
        const dom_uncertainty_button = document.createElement("button");
        dom_uncertainty_button.id = "uncertainty_btn";
        dom_uncertainty_button.className = "bam-btn-simple"
        bamI.set(dom_uncertainty_button).key("variable_withuncertainty").text().apply();
        dom_uncertainty_button.addEventListener("click", function() {
            self.toggleUncertainty();
        }); 
        this.dom_wrapper.append(dom_uncertainty_button);

        // variable values
        const dom_value_div = document.createElement("div");
        dom_value_div.id = "select-div";
        dom_values_panel.append(dom_value_div);
        const dom_value_name = document.createElement("div");
        dom_value_name.id = "select-name";
        // dom_value_name.innerHTML = "&mu;";
        bamI.set(dom_value_name).key("variable_value").text().apply()
        dom_value_div.append(dom_value_name);
        this.dom_value_select = bamCreateSelect("value-select");
        dom_value_div.append(this.dom_value_select);

        // variable uncertainties
        const dom_uncertainty_panel = document.createElement("div");
        dom_uncertainty_panel.id = "uncertainty-panel";
        dom_values_panel.append(dom_uncertainty_panel);

        // uncertainty U
        const dom_u_div = document.createElement("div");
        dom_u_div.id = "select-div";
        dom_uncertainty_panel.append(dom_u_div);
        const dom_u_name = document.createElement("div");
        dom_u_name.id = "select-name";
        // dom_u_name.innerHTML = "&sigma;<sub>NS</sub>";
        bamI.set(dom_u_name).key("variable_std").text().apply()
        dom_u_div.append(dom_u_name);
        this.dom_u_select = bamCreateSelect("u-select");
        dom_u_div.append(this.dom_u_select)

        // uncertainty B
        const dom_b_div = document.createElement("div");
        dom_b_div.id = "select-div";
        dom_uncertainty_panel.append(dom_b_div);
        const dom_b_name = document.createElement("div");
        dom_b_name.id = "select-name";
        // dom_b_name.innerHTML = "&sigma;<sub>S</sub>";
        bamI.set(dom_b_name).key("variable_std").text().apply()
        dom_b_div.append(dom_b_name);
        this.dom_b_select = bamCreateSelect("b-select");
        dom_b_div.append(this.dom_b_select)

        // uncertainty B.index
        const dom_bindex_div = document.createElement("div");
        dom_bindex_div.id = "select-div";
        dom_uncertainty_panel.append(dom_bindex_div);
        const dom_bindex_name = document.createElement("div");
        dom_bindex_name.id = "select-name";
        // dom_bindex_name.innerHTML = "i<sub>S</sub>";
        bamI.set(dom_bindex_name).key("variable_std").text().apply()
        dom_bindex_div.append(dom_bindex_name);
        this.dom_bindex_select = bamCreateSelect("bindex-select");
        dom_bindex_div.append(this.dom_bindex_select);
    
        // add the default option, which is the empty option
        this.dom_value_select.addOption("-", "-");
        this.dom_u_select.addOption("-", "-");
        this.dom_b_select.addOption("-", "-");
        this.dom_bindex_select.addOption("-", "-");
        this.dom_value_select.setSelectedByKey("-");
        this.dom_u_select.setSelectedByKey("-");
        this.dom_b_select.setSelectedByKey("-");
        this.dom_bindex_select.setSelectedByKey("-");

        // to react to any change and verify validity state, add these callbacks
        this.dom_value_select.onchange = function() { self.onChange() };
        this.dom_u_select.onchange = function() { self.onChange() };
        this.dom_b_select.onchange = function() { self.onChange() };
        this.dom_bindex_select.onchange = function() { self.onChange() };

        // display or not uncertainty
        if (!any_u) {
            dom_uncertainty_button.style.display = "none";
        } else {
            if (!b) {
                dom_b_div.style.display = "none";
                dom_bindex_div.style.display = "none";
            }
            if (!u) {
                dom_u_div.style.display = "none";
            }
        }
    }

    setParent(parent) {
        parent.append(this.dom_wrapper);
    }

    updateMappingOptions(mapping_options) {
        // console.log(this.name);
        // console.log(mapping_options);

        let options = [];     // all the mapping options
        let options_in = [];  // those that need to be added
        let options_out = []; // those that no longer exist

        // detect the options that need to be added
        for (let opt of mapping_options) {
            if (this.options.indexOf(opt) === -1) {
                this.options.push(opt); // update the actual option list
                options_in.push(opt);   // add to the new option list
            }
            options.push(opt)
        }

        // detect the options that need to be deleted
        for (let k = this.options.length - 1; k >= 0; k--) {
            if (options.indexOf(this.options[k]) === -1) {
                options_out.push(this.options[k])
                this.options.splice(k, 1);
            }
        }

        // remove the options that no longer exist
        for (let k = 0; k < options_out.length; k++) {
            this.dom_value_select.removeOptionByKey(options_out[k], "-");
            this.dom_u_select.removeOptionByKey(options_out[k], "-");
            this.dom_b_select.removeOptionByKey(options_out[k], "-");
            this.dom_bindex_select.removeOptionByKey(options_out[k], "-");
        }
        
        // add the new options
        for (let k = 0; k < options_in.length; k++) {
            this.dom_value_select.addOption(options_in[k], options_in[k]);
            this.dom_u_select.addOption(options_in[k], options_in[k]);
            this.dom_b_select.addOption(options_in[k], options_in[k]);
            this.dom_bindex_select.addOption(options_in[k], options_in[k]);
        }

        // auto detect the option by matching names
        const selected_value_key = this.dom_value_select.getSelected().key;
        if (!selected_value_key || selected_value_key === "-") { // if nothing is selected
            const all_options = this.dom_value_select.getAllOptions().map((x) => x.key.split(' > ')[1]);
            const var_name = this.name;
            for (let k = 0; k < all_options.length; k++) {
                if (var_name === all_options[k]) {
                    this.dom_value_select.setSelected(k);
                    break;
                }
            }
        }
    }
    
    onChange() {
        if (this.onChangeCallback) this.onChangeCallback();
    }

    toggleUncertainty() {
        const btn = this.dom_wrapper.querySelector("#uncertainty_btn");
        if (this.dom_wrapper.hasAttribute("visible")) {
            this.dom_wrapper.removeAttribute("visible");
            bamI.set(btn).key("variable_withuncertainty").text().apply();
        } else {
            this.dom_wrapper.setAttribute("visible", "");
            bamI.set(btn).key("variable_withoutuncertainty").text().apply();
        }
    }

    delete() {
        this.dom_wrapper.remove();
    }

    // getValidityStatus() {
    //     // rules are: 
    //     // > v must be set 
    //     // > if b is specified, b.index must also be specified
    //     const status = {value: false, b: false}
    //     const m = this.getMapping();
    //     status.value = m.v !== "" && m.v !== "-";
    //     status.b     = ((m.b === "" || m.b === "-") && 
    //                     (m.bindex === "" || m.bindex === "-")) || 
    //                    ((m.b !== "" && m.b !== "-") && 
    //                     (m.bindex !== "" && m.bindex !== "-"));
    //     return status;
    // }

    getMapping() {
        const v = this.dom_value_select.getSelected().key;
        const u = this.dom_u_select.getSelected().key;
        const b = this.dom_b_select.getSelected().key;
        const bindex = this.dom_bindex_select.getSelected().key;
        const mapping = {
            v: v,
            u: u,
            b: b,
            bindex: bindex
        };
        return mapping;
    }
    setMapping(mapping) {
        if (mapping.v) {
            this.dom_value_select.setSelectedByKey(mapping.v);
        }
        if (mapping.u) {
            this.dom_u_select.setSelectedByKey(mapping.u);
        }
        if (mapping.b) {
            this.dom_b_select.setSelectedByKey(mapping.b);
        }
        if (mapping.bindex) {
            this.dom_bindex_select.setSelectedByKey(mapping.bindex);
        }
    }
    get() {
        const config = {
            mapping_options: this.options,
            name: this.name,
            mapping: this.getMapping()
        };
        return config;
    }
    set(config) {
        this.name = config.name;
        this.dom_wrapper.querySelector("#name").textContent = config.name;
        if (config.mapping_options) {
            this.updateMappingOptions(config.mapping_options);
        }
        if (config.mapping) {
            this.setMapping(config.mapping)
        }
    }

    

}