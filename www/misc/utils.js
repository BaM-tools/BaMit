/**
 * @description given an object or array, check if it is an array. If not
 *              create a single element array.
 *              This functions is here only to deal the fact that the JSON
 *              parser used by Shiny automatically collapse one element arrays.
 * @param {Object or Array} data 
 * @author Ivan Horner
 */
function bamProcessArrayFromR(data) {
    if (data) {
        if (!Array.isArray(data)) data = [data];
    } else {
        data = [];
    }
    return data;
}

function areConfigurationsIdentical(config1, config2) {
    // console.log("-----------------")
    // console.log(config1)
    // console.log(config2)
    if (Object.prototype.toString.call(config1) === '[object Object]' && 
        Object.prototype.toString.call(config2) === '[object Object]') {
        // console.log("--> object")
        let keys1 = Object.keys(config1);
        let keys2 = Object.keys(config2);
        // console.log(keys1)
        // console.log(keys2)
        for (let key of keys1) {
            // console.log(key)
            if (keys2.indexOf(key) === -1) {
                return false;
            }
            let res = areConfigurationsIdentical(config1[key], config2[key]);
            if (!res) {
                return false;
            }
        }
    } else if (Object.prototype.toString.call(config1) === '[object Array]' && 
               Object.prototype.toString.call(config2) === '[object Array]') {
        // console.log("--> array")
        let n = config1.length;
        if (config2.length !== n) {
            return false;
        }
        for (let k = 0; k < n; k++) {
            let res = areConfigurationsIdentical(config1[k], config2[k]);
            if (!res) {
                return false;
            }
        }
    } else {
        // console.log("--> misc")
        if (config1 != config2) {
            return false;
        }
    }
    return true;
}


/**
 * @description check if a status is valid by recusirvely checking that all items that exist are set to 'true'
 * @param {object} status an object searched recursively for any element to be not 'true'
 * @author Ivan Horner
 */
function isStatusValid(status) {
    let isValid = true;
    for (let s in status) {
        if (status[s]) {
            if (typeof status[s] === 'object' && status[s] !== null) {
                if (!isStatusValid(status[s])) {
                    isValid = false;
                }
            } else if (status[s] !== true) {
                isValid = false;
            } 
        } else {
            isValid = false;
        }
    }
    return isValid;
}

/**
 * @description Build a custom bamMessage object (see bamMessage class) to ask the user for
 * an input. It creates a question with a text message, an input field, and OK and Cancel buttons.
 * This is here to limite code repetition as this kind of message is needed in different parts of the app.
 * @param {string} message Text message to display before the input field
 * @param {function} callback Action to take place when the user click "OK"
 * @param {Object} options Additional configuration option including 
 *                         > placeholder: string, optional placehold text for the input field
 *                         > default_value: string, optional default contenty of the input field
 * @author Ivan Horner
 */
function askForInput(message, callback, options = {placeholder:null, default_value:"", validation_function: null} ) {

    const dom_message_content = document.createElement("div")
    dom_message_content.style.width = "100%"
    dom_message_content.style.display = "flex"
    dom_message_content.style.flexDirection = "column"

    const dom_error_message = document.createElement("div")
    dom_error_message.style.color = "darkred"
    dom_error_message.style.width = "100%"
    dom_error_message.style.display = "flex";
    dom_error_message.style.justifyContent = "center";
    dom_error_message.style.alignItems = "center";
    dom_error_message.textContent = "";

    const dom_message = document.createElement("div");
    dom_message.style.width = "100%"
    dom_message.style.display = "flex";
    dom_message.style.justifyContent = "center";
    dom_message.style.alignItems = "center";

    dom_message_content.append(dom_message)
    dom_message_content.append(dom_error_message)

    const dom_question = document.createElement("div");
    // dom_question.textContent = bamI.getText("ask_project_name");
    // dom_question.textContent = bamI.getText(_message_key);
    dom_question.textContent = message;

    const dom_nameinput = document.createElement("input");
    // dom_nameinput.placeholder = bamI.getText("project_name");
    if (options.placeholder) dom_nameinput.placeholder = options.placeholder;
    if (options.default_value) dom_nameinput.value = options.default_value;
    dom_nameinput.style.width = "200px";
    dom_nameinput.onkeypress = function(e) {
        if (e.keyCode == 13) dom_validatebtn.click();
    }
    dom_nameinput.classList.add("bam-message-focus");

    const dom_validatebtn = document.createElement("button");
    dom_validatebtn.textContent = bamI.getText("ok");
    // dom_validatebtn.classList.add("bam-message-destroy");
    dom_validatebtn.addEventListener("click", function() {
        const value =  this.parentElement.querySelector("input").value;
        if (options.validation_function) {
            errorMessage = options.validation_function(value)
            if (errorMessage) {
                console.log(errorMessage)
                dom_error_message.textContent = errorMessage;
                return; 
            }
        }
        bamMsg.destroy(0);
        callback(value);
    })

    const dom_cancelbtn = document.createElement("button");
    dom_cancelbtn.textContent = bamI.getText("cancel");
    dom_cancelbtn.classList.add("bam-message-destroy");


    dom_message.append(dom_question)
    dom_message.append(dom_nameinput)
    dom_message.append(dom_validatebtn)
    dom_message.append(dom_cancelbtn)

    const bamMsg = new bamMessage({
        type: "info",
        custom: dom_message_content,
        auto_destroy: false
    })
}

/**
 * @description A wrapper around askForInput() function for the specific case of project name
 * @param {function} callback Action to take place when the user click "OK"
 * @param {Object} default_value optional default contenty of the input field
 * @author Ivan Horner
 */
askForProjectNameInput = function(callback, default_value="") {
    askForInput(bamI.getText("ask_project_name"), callback,
     {
        placeholder: bamI.getText("project_name"),
        default_value: default_value,
        validation_function: function(value) {
            if (value.length > 30) {
                return "Project name too long. Maximum number of character is 30."
            } else if (value.length <= 0) {
                return "Project name too short. Minimum number of character is 1."
            } else if (/[~`!#$%\^&*+=\-\[\]\\'();,/{}|\\":<>\?]/g.test(value)) {
                return "Project name contains special character (~`!#$%^&*+=\\-[]'();,/{}|\":<>?)"
            }
            return false;
        }
    });
}
/**
 * @description A wrapper around askForInput() function for the specific case of project name
 * @param {function} callback Action to take place when the user click "OK"
 * @param {Object} default_value optional default contenty of the input field
 * @author Ivan Horner
 */
askForPredictionNameInput = function(callback, existing_names, default_value="") {
    // askForInput(bamI.getText("ask_prediction_name"), callback,
    askForInput("Set the name of the prediction", callback,
     {
        // placeholder: bamI.getText("prediction_name"),
        placeholder: "Prediciton name",
        default_value: default_value,
        validation_function: function(value) {
            if (value.length > 30) {
                return "Prediction name too long. Maximum number of character is 30."
            } else if (value.length <= 0) {
                return "Prediction name too short. Minimum number of character is 1."
            } else if (/[~`!#$%\^&*+=\-\[\]\\'();,/{}|\\":<>\?]/g.test(value)) {
                return "Prediction name contains special character (~`!#$%^&*+=\\-[]'();,/{}|\":<>?)"
            } else if (existing_names.indexOf(value) !== -1) {
                return "Prediction name already used for another prediction."
            }
            return false;
        }
    });
}

// applyDatasetMapping = function (datasets, map, lengthOnly=false)  {
//     let map_codes = map.split(" > ");
//     if (map_codes.length === 2 && datasets[map_codes[0]]) {
//         if (lengthOnly) return datasets[map_codes[0]].data[map_codes[1]].length;
//         return datasets[map_codes[0]].data[map_codes[1]];
//     } else {
//         if (lengthOnly) return 0;
//         return []; 
//     }
// }
encodeDatasetMapping = function(dataset_name, dataset_variables, whole_file_option=false) {
    const mapping_codes = [];
    for (let variable of dataset_variables) {
        mapping_codes.push(dataset_name + " > " + variable);
    }
    if (whole_file_option) {
        mapping_codes.push(dataset_name + " > *")
    }
    return mapping_codes;
}
decodeDatasetMapping = function(mapping_codes) {
    const mapping = [];
    for (let mapping_code of mapping_codes) {
        let map_code = mapping_code.split(" > ");
        if (map_code.length !== 2) {
            throw "Debugging: this should not happen!";
        }
        mapping.push(map_code);
    }
    return mapping;
}

/**
 * @description just for fun (useless I should say): a color theme switcher / manager
 * There is a special mode you can enable with
 * changeColorTheme().disco() or changeColorTheme().disco(200)
 * any call to changeColorTheme() will disable the mode
 * 
 * @author Ivan Horner
 */
changeColorTheme = (function() {
    getColorThemeCatalogue = function() {
        return {
            blue: {
                verystrong: "rgb(103, 187, 255)",
                strong: "rgb(158, 211, 255)",
                regular: "rgb(219, 237, 255)",
                light: "rgb(235, 245, 255)",
                verylight: "rgb(244, 249, 255)"
            },
            orange: {
                verystrong: "rgb(255, 208, 78)",
                strong: "rgb(255, 232, 158)",
                regular: "rgb(255, 242, 219)",
                light: "rgb(255, 249, 235)",
                verylight: "rgb(255, 250, 244)"
            },
            green: {
                verystrong: "rgb(100, 199, 105)",
                strong: "rgb(158, 255, 171)",
                regular: "rgb(219, 255, 219)",
                light: "rgb(235, 255, 238)",
                verylight: "rgb(244, 255, 245)"
            },
            grey: {
                verystrong: "rgb(156, 156, 156)",
                strong: "rgb(204, 204, 204)",
                regular: "rgb(224, 224, 224)",
                light: "rgb(238, 238, 238)",
                verylight: "rgb(243, 243, 243)"
            },
            yellow: {
                verystrong: "rgb(223, 200, 0)",
                strong: "rgb(255, 246, 117)",
                regular: "rgb(255, 252, 194)",
                light: "rgb(255, 253, 215)",
                verylight: "rgb(255, 253, 236)"
            },
            violey: {
                verystrong: "rgb(192, 84, 196)",
                strong: "rgb(252, 163, 255)",
                regular: "rgb(254, 215, 255)",
                light: "rgb(255, 234, 254)",
                verylight: "rgb(254, 244, 255)"
            },
            red: {
                verystrong: "rgb(255, 103, 103)",
                strong: "rgb(255, 158, 158)",
                regular: "rgb(255, 219, 219)",
                light: "rgb(255, 235, 235)",
                verylight: "rgb(255, 244, 244)"
            },
            multi1: {
                verystrong: "rgb(255, 113, 78)",
                strong: "rgb(255, 221, 158)",
                regular: "rgb(223, 255, 219)",
                light: "rgb(235, 255, 255)",
                verylight: "rgb(253, 244, 255)"
            },
            multi2: {
                verystrong: "rgb(255, 113, 78)",
                strong:  "rgb(83, 208, 247)",
                regular: "rgb(255, 221, 158)",
                light: "rgb(235, 255, 255)",
                verylight: "rgb(253, 244, 255)"
            }
        }
    }
    var colorThemes = getColorThemeCatalogue();
    var currentTheme = "blue";
    var discoMode = null;
    var discoModeTime = 1000;
    enableDiscoMode = function() {
        disableDiscoMode();
        discoMode = setInterval(function() {
            let themeKeys = Object.keys(colorThemes)
            let i = themeKeys.indexOf(currentTheme);
            if (i < (themeKeys.length - 1)) {
                currentTheme = themeKeys[i + 1]
            } else {
                currentTheme = themeKeys[0]
            }
            setColorTheme();
        }, discoModeTime)
    }
    disableDiscoMode = function() {
        if (discoMode) {
            clearInterval(discoMode);
            discoMode = null;
        }
    }
    setColorTheme = function() {
        document.documentElement.style.setProperty('--verystrong', colorThemes[currentTheme].verystrong);
        document.documentElement.style.setProperty('--strong', colorThemes[currentTheme].strong);
        document.documentElement.style.setProperty('--regular', colorThemes[currentTheme].regular);
        document.documentElement.style.setProperty('--light', colorThemes[currentTheme].light);
        document.documentElement.style.setProperty('--verylight', colorThemes[currentTheme].verylight);
    }

    /**
     * main function/closure that is accessible from outside this constructor / function factory
     * belows are listed all the method associated to this main function to alter its behavior
     */
    colorThemeSwitch = function(key) {
        disableDiscoMode()
        if (colorThemes[key]) {
            currentTheme = key;
            setColorTheme();
        }
        return colorThemeSwitch;
    }
    colorThemeSwitch.disco = function(value=1000) {
        discoModeTime = value;
        enableDiscoMode()
        return colorThemeSwitch;
    } 
    colorThemeSwitch.reset = function() {
        disableDiscoMode()
        colorThemes = getColorThemeCatalogue();
        currentTheme = "blue";
        setColorTheme()
        return colorThemeSwitch;
    }
    colorThemeSwitch.verystrong = function(value) {
        if (!arguments.length) return colorThemes[currentTheme].verystrong
        colorThemes[currentTheme].verystrong = value;
        setColorTheme()
        return colorThemeSwitch;
    }
    colorThemeSwitch.strong = function(value) {
        if (!arguments.length) return colorThemes[currentTheme].strong
        colorThemes[currentTheme].strong = value;
        setColorTheme()
        return colorThemeSwitch;
    }
    colorThemeSwitch.regular = function(value) {
        if (!arguments.length) return colorThemes[currentTheme].regular
        colorThemes[currentTheme].regular = value;
        setColorTheme()
        return colorThemeSwitch;
    }
    colorThemeSwitch.light = function(value) {
        if (!arguments.length) return colorThemes[currentTheme].light
        colorThemes[currentTheme].light = value;
        setColorTheme()
        return colorThemeSwitch;
    }
    colorThemeSwitch.verylight = function(value) {
        if (!arguments.length) return colorThemes[currentTheme].verylight
        colorThemes[currentTheme].verylight = value;
        setColorTheme()
        return colorThemeSwitch;
    }
    return colorThemeSwitch;
})();