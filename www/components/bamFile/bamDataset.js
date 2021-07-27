class bamDataset extends bamFile {
    constructor(name, data, actions={}) {

        const createFile = (name, data) => {
            // format the data
            const headers = Object.keys(data);
            const nrow    = data[headers[0]].length;
            const ncol    = headers.length;
            const file_data    = []
            for (let j=0; j < ncol; j++) {
                file_data.push(headers[j])
                if (j!=(headers.length-1)) {
                    file_data.push("\t");
                } else {
                    file_data.push("\r\n");
                }
            }
            for (let i=0; i < nrow; i++) {
                for (let j=0; j < ncol; j++) {
                    file_data.push(data[headers[j]][i])
                    if (j!=(ncol-1)) {
                        file_data.push("\t");
                    } else {
                        file_data.push("\r\n");
                    }
                }
            }
            // create the file
            const file = new File(file_data, name, {type: "text/plain"})
            return file
        }

        super(createFile(name, data), actions) // if a file is provided, don't create one

        this.name = name
        this.data = data

        // add the dimensions in the DOM elements
        this.addDimDOM()

    }
    addDimDOM() {
        this.dom_dim = document.createElement("div")
        this.dom_dim.className = "dim"
        const dim = this.getDim()
        this.dom_dim.textContent = `[${dim.nrow}x${dim.ncol}]`
        this.dom_left.insertBefore(this.dom_dim, this.dom_size)
    }

    getData() {
        return this.data
    }
    getDataHeaders() {
        return Object.keys(this.data)
    }
    getVariable(variable) {
        return this.data[variable]
    }
    getDim() {
        const headers = this.getDataHeaders()
        return {
            nrow: this.data[headers[0]].length,
            ncol: headers.length
        }
    }
    get() {
        return {
            name: this.name,
            data: this.data,
        }
    }
}

