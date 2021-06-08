function bamCreateSelect(id) {
    const dom_select = document.createElement("div");
    dom_select.className = "bam-select-dropdown";
    dom_select.id = id;

    const dom_selected = document.createElement("button");
    dom_selected.className = "bam-select-dropdown-selected";
    // dom_selected.contentEditable = true;
    dom_selected.textContent = "";
    dom_selected.key = "";
    dom_select.append(dom_selected)

    const dom_options = document.createElement("div");
    dom_options.className = "bam-select-dropdown-options";
    dom_select.append(dom_options)

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

    function findIndexFromKey(key) {
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

    dom_select.getSelected = function() {
        return {
            value: dom_selected.textContent,
            key: dom_selected.key
        };
    }

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

    dom_select.setSelectedFromIndex = function(index) {
        const options = dom_options.children;
        dom_selected.textContent = options[index].textContent;
        dom_selected.key = options[index].key;
        if (options[index].getAttribute("bam-internationalization")) {
            dom_selected.setAttribute("bam-internationalization", options[index].getAttribute("bam-internationalization"))
        }
        for (let k = 0; k < options.length; k++) {
            options[k].removeAttribute("selected")
        }
        options[index].setAttribute("selected", "")
        if (dom_select.onchange) dom_select.onchange({value: dom_selected.textContent, key: dom_selected.key});
    }

    dom_select.setSelected = function(index) {
        dom_select.setSelectedFromIndex(index);
    }

    dom_select.setSelectedByKey = function(key) {
        let index = findIndexFromKey(key);
        if (index != -1) {
            dom_select.setSelectedFromIndex(index);
        }
    }

    dom_select.removeOption = function(index) {
        const opt = dom_options.children[index];
        if (opt.key === dom_selected.key) {
            dom_selected.textContent = "";
            dom_selected.key = "";
        }
        opt.remove();
    }
    dom_select.removeOptionByKey = function(key) {
        let index = findIndexFromKey(key);
        dom_select.removeOption(index);
    }

    document.addEventListener("click", function(e) {
        dom_select.removeAttribute("open");
    })
    return dom_select;
}

function bamCreateSelectOption(select, key, value) {
    const dom_option = document.createElement("button");
    dom_option.key = key;
    dom_option.textContent = value;
    select.querySelector(".bam-select-dropdown-options").append(dom_option);
    const selected = select.querySelector(".bam-select-dropdown-selected");
    dom_option.addEventListener("click", function(e) {
        e.stopPropagation();
        if (selected.key != this.key) {
            select.setSelectedByKey(this.key);
        }
        select.removeAttribute("open")
        selected.focus();
    })
    return dom_option;
}