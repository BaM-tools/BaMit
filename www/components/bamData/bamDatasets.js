// import parseFile from "./../bamFile/dataFileParser"
/**
 * @description
 * Dataset import/management class. It manages the import of dataset (CSV files)
 * through a "browse" button or a drag & drop feature. Dataset are opened and parsed using the Papa library
 * 
 * @requires Papa
 * 
 * @author Ivan Horner
 */
class bamDatasets {

    constructor() {

        let self = this;

        // this an object containing dataset object indexed by the dataset names (filename)
        // a dataset object is a three component object {name, data, dom}
        this.datasets = {};

        // **********************************************************
        // main wrapper
        this.dom_wrapper = document.createElement("div");
        this.dom_wrapper.className = "bam-datasets";

        // **********************************************************
        // header text
        const dom_header = document.createElement("div");
        dom_header.id = "header";     
        bamI.set(dom_header).key("datasets_import_title").text().apply();

        const dom_helper = document.createElement("ul");
        let li = document.createElement("li");
        dom_helper.append(li);
        bamI.set(li).key("datasets_import_help_a").text().apply();
        li = document.createElement("li");
        dom_helper.append(li);
        bamI.set(li).key("datasets_import_help_b").text().apply();
        li = document.createElement("li");
        dom_helper.append(li);
        bamI.set(li).key("datasets_import_help_c").text().apply();
        li = document.createElement("li");
        dom_helper.append(li);
        bamI.set(li).key("datasets_import_help_d").text().apply();
        li = document.createElement("li");
        dom_helper.append(li);
        bamI.set(li).key("datasets_import_help_e").text().apply();

        // **********************************************************
        // import button and drag & drop action

        // file reader and parser
        function readAndParseFile(files) {
            let toobig = [];
            for (let f of files) { // for each file
                if (f.size < 10000000) { // check size
                // if (f.size < 100000000000000) { // check size
                    if (self.datasets[f.name]) {
                        // if already a file with the same name
                        // warn that it will replace the already existing one
                        new bamMessage({
                            message: bamI.getText("dataset_samefilename_warning"),
                            type: "warning",
                            question: true,
                            yes: function() {
                                // replace dataset
                                // self.datasets[f.name].dom.remove();
                                // delete self.datasets[f.name];
                                // self.parseDataset(f);
                                self.datasets[f.name].removeDOM();
                                delete self.datasets[f.name];
                                // self.parseDataset(f);
                                parseFile(f).then((dataset) => {
                                    self.addDataset(dataset);
                                })
                                
                            }
                        })
                    } else {
                        // add the dataset
                        // self.parseDataset(f);
                        // self.parseDataset(f);
                        parseFile(f).then((dataset) => {
                            self.addDataset(dataset);
                        })
                    }
                } else {
                    toobig.push(f)
                }
            }
            if (toobig.length != 0) {
                new bamMessage({
                    message: bamI.getText("file_too_big"),
                    type: "error"
                });
            }
        }
        // drag & drop
        ["dragenter", "dragover", "dragleave", "drop"].forEach(evt => {
            self.dom_wrapper.addEventListener(evt, (e) => {
                e.preventDefault()
                e.stopPropagation()
            })
        })
        this.dom_wrapper.addEventListener("drop", function(e) {
            readAndParseFile(e.dataTransfer.files)
        })

        // import button
        const dom_import_button_hidden = document.createElement("input");
        dom_import_button_hidden.type = "file";
        dom_import_button_hidden.accept = "text/csv, .txt";
        dom_import_button_hidden.multiple = true;
        dom_import_button_hidden.addEventListener("change", function() {
            readAndParseFile(this.files)
        });
        const dom_import_button = document.createElement("button");
        dom_import_button.id = "bam-dataset-import";
        dom_import_button.addEventListener("click", function() {dom_import_button_hidden.click()});
        bamI.set(dom_import_button).key("import_dataset").text().apply();

        // **********************************************************
        // opened datasets/files list
        const dom_datasets_list = document.createElement("div");
        dom_datasets_list.className = "bam-datasets-list"

        // **********************************************************
        // append to main wrapper
        this.dom_wrapper.append(dom_header);
        this.dom_wrapper.append(dom_helper);
        this.dom_wrapper.append(dom_import_button);
        this.dom_wrapper.append(dom_datasets_list);

    }

    setParent(parent) {
        parent.append(this.dom_wrapper)
    }


    addDataset(new_dataset) {
        this.datasets[new_dataset.name] = new bamDataset(new_dataset.name, new_dataset.data,  
            {
                preview: () => {
                    const data = this.datasets[new_dataset.name].get()
                    this.onDisplayDatasetCallback(data)
                },
                delete: () => {
                    this.onDeleteDatasetCallback(new_dataset.name);
                    this.datasets[new_dataset.name].removeDOM();
                    delete this.datasets[new_dataset.name];
                    this.onChange();
                },
                // download: true,
            }    
        )
        this.dom_wrapper.querySelector(".bam-datasets-list").append(this.datasets[new_dataset.name].getDOM()) 
        this.onChange();
    }

    onChange() {
        if (this.onChangeCallback) this.onChangeCallback();
    }

    /**
     * @description retrieve a full dataset object (i.e. {name, data, ...}) from
     * its mapping code (i.e. "filename > variablename")
     * @param {string} mapping_code a mapping code (i.e. "filename > variablename")
     * @returns {object} a full dataset object (i.e. {name, data, ...}) where
     * ... is for the additional element attached to it such as dataset dimension
     * or the DOM element to display the dataset. If the mapping code is found invalid
     * null is return.
     */
    getDataset(mapping_code) {
        const mapping = this.decodeMapping(mapping_code);
        if (mapping.file) {
            return this.datasets[mapping.file];
            // return 
        }
        return null;
    }
    /**
     * @description retrieve a variable (an array) from
     * its mapping code (i.e. "filename > variablename")
     * @param {string} mapping_code a mapping code (i.e. "filename > variablename")
     * @returns {array} an array of float corresponding to the variable. If the mapping code
     * is found invalid, null is returned.
     */
    getVariable(mapping_code) {
        const mapping = this.decodeMapping(mapping_code);
        if (mapping.file && mapping.variable) {
            // return this.datasets[mapping.file].data[mapping.variable];
            return this.datasets[mapping.file].getVariable(mapping.variable);
        }
        return null;
    }
    /**
     * @description retrun the length of a variable (an integer) from
     * its mapping code (i.e. "filename > variablename")
     * @param {string} mapping_code a mapping code (i.e. "filename > variablename")
     * @returns {integer} an integer corresponding to the length of the variable.
     * If the mapping code is found invalid, 0 is returned.
     */
    getVariableLength(mapping_code) {
        const mapping = this.decodeMapping(mapping_code);
        if (mapping.file && this.datasets[mapping.file]) {
            // return this.datasets[mapping.file].dim.nrow;
            return this.datasets[mapping.file].getDim().nrow;
        }
        return 0;
    }
    /**
     * @description decodes a mapping code (i.e. "filename > variablename") and returns
     * an object with the file name and the variable name (i.e. {file, variable})
     * @param {string} mapping_code a mapping code (i.e. "filename > variablename")
     * @returns {object} an object with two component containg strings: (1) a "file"
     * component containing the dataset file name and (2) a "variable" component 
     * continaint the variable name. The structure of the object is thus {file: ..., variable: ...}
     * If the mapping code is found invalid, the file and variable component are set to null
     */
    decodeMapping(mapping_code) {
        const mapping = {file: null, variable: null};
        let map_code = mapping_code.split(" > ");
        if (map_code.length === 2) {
            mapping.file = map_code[0];
            if (map_code[1] !== "*") {
                mapping.variable = map_code[1];
            }
        } 
        return mapping;
    }
    /**
     * @description return all the pair filenames/variable loaded by the user in the form of an
     * array of strings, each string being a mapping code. If @param whole_file_option
     * is set to true, an addition option is returned correponding to the whole file (i.e. all
     * the variables within the file)
     * @param {boolean} whole_file_option whether the additional option corresponding to the whole
     * file should be returned as well. 
     * @returns {array} an array of strings, each string being a mapping code corresponding to a 
     * variable within a dataset.
     */
    getDatasetsMappingOptions(whole_file_option=false) {
        const mapping_codes = [];
        for (let dataset_name in this.datasets) {
            // let dataset_variables = Object.keys(this.datasets[dataset_name].data);
            let dataset_variables = this.datasets[dataset_name].getDataHeaders();
            if (whole_file_option) {
                mapping_codes.push(dataset_name + " > *")
            }
            for (let variable of dataset_variables) {
                mapping_codes.push(dataset_name + " > " + variable);
            }
        }
        return mapping_codes;
    }
    
    get() {
        const datasets = {};
        for (let d in this.datasets) {
            // datasets[d] = {
            //     name: this.datasets[d].name,
            //     data: this.datasets[d].data
            // }
            datasets[d] = this.datasets[d].get()
        }
        return datasets;
    }

    set(datasets) {
        if (datasets) {
            this.dom_wrapper.querySelector(".bam-datasets-list").innerHTML = ""; 
            this.datasets = {};
            for (let d in datasets) {
                this.addDataset(datasets[d]);
            }
        }
        // this.onChange();
    }
}