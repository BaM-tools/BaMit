/**
 * @description create a bam-select-dropdown element
 * 
 * @param {string} id id attribute of the bam-select-dropdown
 * 
 * @returns a DOM element with class "bam-select-dropdown"
 *          with all its children and specific functions
 *          attached to it to (1) add/remove options, (2) get all
 *          options, (3) set selected options.
 * 
 * @author Ivan Horner
 */
function bamCreateSelect(id) {

    // create the main DOM element (div)
    const dom_select = document.createElement("div");
    dom_select.className = "bam-select-dropdown";
    dom_select.id = id;

    // create the selected options (button)
    const dom_selected = document.createElement("button");
    dom_selected.className = "bam-select-dropdown-selected";
    dom_selected.textContent = "";
    dom_selected.key = "";
    dom_select.append(dom_selected)

    // create the container of all possible options (div)
    const dom_options = document.createElement("div");
    dom_options.className = "bam-select-dropdown-options";
    dom_select.append(dom_options)

    // add an event listener to the selected option button
    // to toggle the display of all possible options
    dom_select.addEventListener("click", function(e) {
        e.stopPropagation();
        this.toggleAttribute("open");
        const all_select = document.body.querySelectorAll(".bam-select-dropdown");
        for (let k = 0; k < all_select.length; k++) {
            if (this != all_select[k]) {
                all_select[k].removeAttribute("open")
            }
        }

    })

    // add a global event listener to the document to hide the option container
    // when the user click anywhere but on the selected option button
    document.addEventListener("click", function(e) {
        dom_select.removeAttribute("open");
    })

    // an internal function to get the selected option given its key
    function getIndexFromKey(key) {
        const options = dom_options.children;
        let index = -1;
        for (let k = 0; k < options.length; k++) {
            if (options[k].key === key) {
                index = k;
                break;
            }
        }
        return index;
    }

    /****************************************************************
     * @description get the selected options
     * @returns an object with two properties: value and key
     */
    dom_select.getSelected = function() {
        return {
            value: dom_selected.textContent,
            key: dom_selected.key
        };
    }

    /****************************************************************
     * @description get all available options of the bam-select-dropdown
     * @returns an array of object containing all possible options.
     *          each option is an object with two properties: value and key
     */
    dom_select.getAllOptions = function() {
        const options = dom_options.children;
        let all_options = Array(options.length);
        for (let k = 0; k < options.length; k++) {
            all_options[k] = {
                value: options[k].textContent,
                key: options[k].key
            }
        }
        return all_options;
    }

    /****************************************************************
     * @description set the current selected option from its index
     * @param {integer} index position of the option to set as selected
     */
    dom_select.setSelectedFromIndex = function(index) {
        const options = dom_options.children;
        dom_selected.textContent = options[index].textContent;
        dom_selected.key = options[index].key;

            // ****************************
            // FIXME: here is a non-generic bit: 
            // I set the bamI property to enable internationalization
            // on the selected option
            dom_selected.bamI = options[index].bamI;
            dom_selected.setAttribute("bamI", "");
            // ****************************

        for (let k = 0; k < options.length; k++) {
            options[k].removeAttribute("selected")
        }
        options[index].setAttribute("selected", "")
        if (dom_select.onchange) dom_select.onchange({value: dom_selected.textContent, key: dom_selected.key});
    }

    /****************************************************************
     * @description set the current selected option from its index
     * @param {integer} index position of the option to set as selected
     */
    dom_select.setSelected = function(index) {
        dom_select.setSelectedFromIndex(index);
    }

    /****************************************************************
     * @description set the current selected option from its key
     * @param {string} key key of the option to set as selected
     */
    dom_select.setSelectedByKey = function(key) {
        let index = getIndexFromKey(key);
        if (index != -1) {
            dom_select.setSelectedFromIndex(index);
            return true;
        } 
        else {
            return false;
        }
    }

    /****************************************************************
     * @description remove option by index
     * @param {integer} index position of the option to remove
     */
    dom_select.removeOption = function(index, default_option_key) {
        const opt = dom_options.children[index];
        if (opt.key === dom_selected.key) {
            if (default_option_key && getIndexFromKey(default_option_key) !== -1) { // if there is default_option_key defined, use it
                dom_select.setSelectedByKey(default_option_key);
            } else {
                dom_selected.textContent = "";
                dom_selected.key = "";
            }
        }
        opt.remove();
    }

    /****************************************************************
     * @description remove the option by key
     * @param {string} key key of the option to remove
     */
    dom_select.removeOptionByKey = function(key, default_option_key) {
        let index = getIndexFromKey(key);
        dom_select.removeOption(index, default_option_key);
    }

    /****************************************************************
     * @description add an option to the option container
     * @param {string} key 
     * @param {string} value 
     * @returns the created option DOM element
     */
    dom_select.addOption = function(key, value) {
        // create the option
        const dom_option = document.createElement("button");
        dom_option.key = key;
        dom_option.textContent = value;
        // add it to the options container
        dom_options.append(dom_option); 
        // when clicked, set the current selected option to 
        // be this option, hide options container and set the
        // focus to the selected option.
        dom_option.addEventListener("click", function(e) {
            e.stopPropagation();
            if (dom_selected.key != this.key) {
                dom_select.setSelectedByKey(this.key);
            }
            dom_select.removeAttribute("open")
            dom_selected.focus();
        })
        // return the option DOM element for customization
        return dom_option;
    }

    return dom_select;
}
