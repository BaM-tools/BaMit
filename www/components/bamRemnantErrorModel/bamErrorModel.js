/**
 * @description
 * BaM error model class
 * 
 * @author Ivan Horner
 */
class bamErrorModel {
    constructor() {

        // hard coded available error models
        let self = this;
        this.error_models = {
            Linear: [
                {
                    // name: "&gamma;<sub>1</sub>",
                    name: "g1",
                    initial: 1,
                    dist_name: "FlatPrior+",
                    dist_parameters: []
                },
                {
                    // name: "&gamma;<sub>2</sub>",
                    name: "g2",
                    initial: 0.01,
                    dist_name: "FlatPrior+",
                    dist_parameters: []
                }
            ],
            Constant: [
                {
                    // name: "&gamma;",
                    name: "g",
                    initial: 0.1,
                    dist_name: "FlatPrior+",
                    dist_parameters: []
                }
            ]
        }

        this.parameters = [];
        this.name;

        // main wrapper
        this.dom_wrapper = document.createElement("div");
        this.dom_wrapper.className = "bam-error-model";

        // output name
        const dom_name = document.createElement("div");
        this.dom_wrapper.append(dom_name);
        dom_name.className = "name";
        const dom_name_span = document.createElement("span");
        // dom_name_span.textContent = name;
        dom_name.append(dom_name_span)

        // error model type
        const dom_model =document.createElement("div");
        this.dom_wrapper.append(dom_model);
        dom_model.className = "model";
        this.dom_model_select = bamCreateSelect("model-select");
        for (let d in this.error_models) {
            if (this.error_models[d]) {
                let opt = this.dom_model_select.addOption();
                bamI.set(opt).key(d).text().apply();
                opt.key = d;
            }
        }
        this.dom_model_select.onchange = function(value) {
            self.parameters = [];
            dom_parameters.innerHTML = "";
            const pars = self.error_models[value.key];
            for (let par of pars) {
                const p = new bamParameter(par.name);
                p.setParent(dom_parameters)
                p.set(par)
                p.onChangeCallback = function(value) {
                    self.onChange();
                }
                self.parameters.push(p)
            }
            self.onChange();
        }
        dom_model.append(this.dom_model_select);

        // error model parameters area
        const dom_parameters = document.createElement("div");
        this.dom_wrapper.append(dom_parameters);
        dom_parameters.className = "parameters";

        // set default
        this.dom_model_select.setSelected(0);

    }

    setParent(parent) {
        parent.append(this.dom_wrapper);
    }

    delete() {
        // FIXME: I could simply do this.dom_wrapper.remove();
        this.dom_wrapper.parentElement.removeChild(this.dom_wrapper);
    }

    onChange() {
        if (this.onChangeCallback) this.onChangeCallback()
    }

    // getValidityStatus() {
    //     for (let p of this.parameters) {
    //         if (!isStatusValid(p.getValidityStatus())) {
    //             return false;
    //         }
    //     }
    //     return true;
    // }

    get() {
        const config = {
            name: this.name,
            model: this.dom_model_select.getSelected().key,
            parameters: []
        }
        for (let p of this.parameters) {
            config.parameters.push(p.get());
        }
        return config;
    }

    set(config) {
        // Is this line async? i.e. will the new field be created quickly enough
        // for the update that happen just after to actually occur
        // me later: I don't understand this comment... 
        this.name = config.name;
        this.dom_wrapper.querySelector(".name").textContent = config.name;
        if (config.model) {
            this.dom_model_select.setSelectedByKey(config.model) 
        }
        if (config.parameters) {
            for (let k = 0; k < this.parameters.length; k++) {
                this.parameters[k].set(config.parameters[k]);
            }
        }
    }

}