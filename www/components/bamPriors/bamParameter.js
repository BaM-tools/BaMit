/**
 * @description
 * This class is for the specification of the prior values of a single parameter.
 * It includes: 
 * (1) a label containing the parameter's name,
 * (2) an input field to specify the parameter's initial value
 * (3) a custom select box to select the prior distribution (default is FlatPrior)
 * (4) and up to 3 distribution's parameters depending on the distribution; they are visible or not depending 
 *     on the current distribution. 
 * 
 * @argument name name of the parameter
 * 
 * @author Ivan Horner
 */
class bamParameter {
    constructor() {
        
        let self = this;

        // parameter name
        const dom_name = document.createElement("div");
        dom_name.id = "name";
        const dom_name_span = document.createElement("span");
        // dom_name_span.textContent = name;
        dom_name.append(dom_name_span);

        // parameter initial guess
        const dom_initial_guess = document.createElement("input");
        dom_initial_guess.id = "initial";
        bamI.set(dom_initial_guess).key("priors_initial").attr("placeholder").apply();
        dom_initial_guess.addEventListener("keyup", function() {
            self.onChange();
        })

        // distribution picker
        const dom_dist_div = document.createElement("div");
        dom_dist_div.id = "dist"
        const dom_dist = bamCreateSelect("dist-select");
        for (let d of BaMCatalogue.distributions) {
            if (BaMCatalogue.parameters[d]) {
                let opt = dom_dist.addOption();
                bamI.set(opt).key(d).text().apply();
                opt.key = d;
            }
        }
        dom_dist_div.append(dom_dist);
        
        // disitribion's parameters (up to 3)
        const dom_dist_parameters = document.createElement("div");
        dom_dist_parameters.id = "dist-parameters";
        for (let k = 0; k < 3; k++) {
            const dom_dist_par = document.createElement("input");
            dom_dist_par.addEventListener("keyup", function() {
                self.onChange();
            })
            dom_dist_parameters.append(dom_dist_par);
        }

        // on distribution change:
        dom_dist.onchange = function(dist) {
            let p = BaMCatalogue.parameters[dist.key];
            for (let k = 0; k < 3; k++) {
                if (k < p.length) {
                    dom_dist_parameters.children[k].style.display = "block"
                    bamI.set(dom_dist_parameters.children[k]).key(p[k]).attr("placeholder").apply();
                } else {
                    dom_dist_parameters.children[k].style.display = "none"
                }
            }
            self.onChange();
        }
        dom_dist.setSelectedByKey("FlatPrior");

        // wrapper
        this.dom_wrapper = document.createElement("div");
        this.dom_wrapper.className = "bam-parameter"
        this.dom_wrapper.append(dom_name);
        this.dom_wrapper.append(dom_initial_guess);
        this.dom_wrapper.append(dom_dist_div);
        this.dom_wrapper.append(dom_dist_parameters);

    }

    setParent(parent) {
        parent.append(this.dom_wrapper)
    }

    delete() {
        this.dom_wrapper.parentElement.removeChild(this.dom_wrapper);
    }

    onChange() {
        if (this.onChangeCallback) this.onChangeCallback(this.get());
    }


    get() {
        const name = this.dom_wrapper.querySelector("#name").querySelector("span").textContent;
        const initial = parseFloat(this.dom_wrapper.querySelector("#initial").value);
        const dist_name = this.dom_wrapper.querySelector("#dist-select").getSelected().key;
        const dist_parameters = this.dom_wrapper.querySelector("#dist-parameters").children;
        const parameters = [];
        for (let p of dist_parameters) {
            if (p.style.display != "none") {
                parameters.push(parseFloat(p.value))
            }
        }
        const out = {
            name: name,
            initial: initial,
            dist_name: dist_name,
            dist_parameters: parameters
        };
        return out;
    }

    set(config) {
        this.dom_wrapper.querySelector("#name").querySelector("span").textContent = config.name;
        if (config.initial !== undefined) {
            this.dom_wrapper.querySelector("#initial").value = config.initial;
        }
        if (config.dist_name !== undefined) {
            this.dom_wrapper.querySelector("#dist-select").setSelectedByKey(config.dist_name);
        }
        if (config.dist_parameters !== undefined) {
            const dist_parameters = this.dom_wrapper.querySelector("#dist-parameters").children;
            for (let k = 0; k < config.dist_parameters.length; k++) {
                dist_parameters[k].value = config.dist_parameters[k];
            }
        }
        this.onChange();
    }

}