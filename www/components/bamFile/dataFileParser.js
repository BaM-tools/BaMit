//FIXME: this is currently not used
class dataFileParser {
    constructor() {

    }

    setFile(file) {
        this.file = file
    }
    
    // parse file using Papa.parse. Made async for a cleaner usage
    async parse() {
        return new Promise((resolve, reject) => {
            Papa.parse(this.file, {
                comments: "#",
                skipEmptyLines: true,
                complete: function(results) {
                    let raw_data = results.data;
                    // is there any float in the first row? if yes, no headers and generate headers
                    const anyFloat = raw_data[0].map( (x) => (parseFloat(x) || parseFloat(x) === 0)).reduce((sum, val) => (sum || val) ? true : false)
                    let data = {};
                    let header = [];
                    if (anyFloat) { // generate headers
                        for (let k = 0; k < raw_data[0].length; k++) {
                            header.push("#" + (k+1))
                            data[header[k]] = Array(raw_data.length);
                        }
                    } else { // takes the header from the first row
                        for (let k = 0; k < raw_data[0].length; k++) {
                            header.push(raw_data[0][k])
                            data[header[k]] = Array(raw_data.length - 1);
                        }
                    }
                    // create the final dataset
                    for (let i = (1 - anyFloat); i < raw_data.length; i++) {
                        for (let j = 0; j < header.length; j++) {
                            let tmp = parseFloat(raw_data[i][j]); 
                            if (tmp === -9999) tmp = NaN;
                            if (isNaN(tmp)) tmp = null;
                            data[header[j]][i - (1 - anyFloat)] = tmp;
                        }
                    }
                    resolve({name: file.name, data: data})
                }, 
                error: function(error) {
                    reject(error)
                }
            })
        })
    }

}

// FIXME: I should make my own parser... I only use a tiny bit of Papa.parse capabilities...
// export default async function parseFile(file, config={}) {
async function parseFile(file, config={}) {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            comments: "#",
            skipEmptyLines: true,
            complete: function(results) {
                let raw_data = results.data;
                // is there any float in the first row? if yes, no headers and generate headers
                const anyFloat = raw_data[0].map( (x) => (parseFloat(x) || parseFloat(x) === 0)).reduce((sum, val) => (sum || val) ? true : false)
                let data = {};
                let header = [];
                if (anyFloat) { // generate headers
                    for (let k = 0; k < raw_data[0].length; k++) {
                        header.push("#" + (k+1))
                        data[header[k]] = Array(raw_data.length);
                    }
                } else { // takes the header from the first row
                    for (let k = 0; k < raw_data[0].length; k++) {
                        header.push(raw_data[0][k])
                        data[header[k]] = Array(raw_data.length - 1);
                    }
                }
                // create the final dataset
                for (let i = (1 - anyFloat); i < raw_data.length; i++) {
                    for (let j = 0; j < header.length; j++) {
                        let tmp = parseFloat(raw_data[i][j].replace(/,/g, '.')); 
                        if (tmp === -9999) tmp = NaN;
                        if (isNaN(tmp)) tmp = null;
                        data[header[j]][i - (1 - anyFloat)] = tmp;
                    }
                }
                resolve({name: file.name, data: data})
            }, 
            error: function(error) {
                reject(error)
            }
        })
    })
}