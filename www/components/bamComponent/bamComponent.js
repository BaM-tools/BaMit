/**
 * @description
 * base BaM component including a header that is clickable to 
 * fold/unfold the content
 * 
 * @author Ivan Horner
 */
class bamComponent {
    constructor() {

        // header
        this.dom_header = document.createElement("div");
        this.dom_header.className = "bam-component-header";
        
        const dom_title = document.createElement("span");
        dom_title.className = "bam-component-title";
        this.dom_header.appendChild(dom_title);

        const dom_actions = document.createElement("div")
        dom_actions.className = "bam-component-actions";
        this.dom_header.appendChild(dom_actions);
        const dom_action_maximized = document.createElement("div")
        dom_actions.append(dom_action_maximized)

        // content
        this.dom_content = document.createElement("div");
        this.dom_content.className = "bam-component-content";
  
        // messages
        this.dom_messages = document.createElement("div");
        this.dom_messages.classList.add("bam-component-messages");
        this.dom_messages.setAttribute("hidden", "");
  
        // wrapper
        this.dom_wrapper = document.createElement("div");
        this.dom_wrapper.className = "bam-component";
        this.dom_wrapper.appendChild(this.dom_header);
        this.dom_wrapper.appendChild(this.dom_content);
        this.dom_wrapper.appendChild(this.dom_messages);

        // event listeners
        dom_action_maximized.addEventListener("click", () => {
            this.maximized = !this.maximized
        })

        this.uptodate_config = undefined;
    }

    // ************************************************************************
    // Methods
    setParent(parent) {
        // set parent:
        parent.append(this.dom_wrapper);
        this.parent = parent;
        // set name:
        bamI.set(this.dom_header.querySelector(".bam-component-title")).key(this.title_key).text().apply()

    }

    getTopLocation() {
        return this.dom_wrapper.offsetTop-this.dom_wrapper.clientTop;
    }
    addExternalNamedItem(item) {
        bamI.set(item).key(this.title_key).text().apply()
    }

    // ************************************************************************
    // outdating of component management
    hasConfig() {
        return this.uptodate_config !== undefined;
    }
    /**
     * @param {object} val
     */
    getUptodateConfig(current_config) {
        if (this.uptodate_config === undefined) {
            // 1/ it doesn't have and uptodate config
            return false;
        } else {
            if (areConfigurationsIdentical(this.uptodate_config, current_config)) {
                // 2/ it has an uptodate config and its equal to the current config
                return true;
            } else {
                // 3/ it has an uptodate config and its different from the current config
                return this.uptodate_config;
            }

        }
    }
    getConfig() {
        return JSON.parse(JSON.stringify(this.uptodate_config)); // make a deep copy
    }
    setConfig(config=undefined, update=undefined) {
        // if (typeof config === "boolean" && config === false) {
        //     return;
        // }*
        // let actual_config
        if (config === undefined) {
            // if undefined, set from current config
            config = this.get(); // this assumes the component as a get method.
        } else {
            // if boolean and true, set from the current config
            // otherwise, do not set the uptodate config
            if (typeof config === "boolean") {
                if (config) {
                    config = this.get();
                } else {
                    return;
                }
            }
            // in all othercases, config is an actual config object
        }
        this.uptodate_config = JSON.parse(JSON.stringify(config)); // make a deep copy
        this.checkConfigOutdating(config, update);
    }
    checkConfigOutdating(config=undefined, update=undefined) {
        if (config===undefined) {
            config = this.get()
        }
        if (this.uptodate_config && !areConfigurationsIdentical(this.uptodate_config, config)) {
            const dom_message = document.createElement("div");
            dom_message.style.display = "flex";
            dom_message.style.justifyContent = "space-between";
            dom_message.style.alignItems = "center";
            const dom_txt = document.createElement("div");
            // dom_txt.textContent = "La configuration a été modifiés sans que ces modifications aient été prises en compte!"
            bamI.set(dom_txt).key("config_has_changed_message_warning").text().apply()
            
            const dom_btn = document.createElement("button");
            dom_btn.className = "bam-btn-simple";
            // dom_btn.textContent = "Annuler les modifications";
            bamI.set(dom_btn).key("config_has_changed_cancel").text().apply()
            dom_btn.addEventListener("click", () => {
                if (update === undefined) {
                    this.set(this.getConfig()) // this assumes the component actually has a set method.
                } else {
                    update(this.getConfig())
                }
                
                dom_message.remove();
            })
            dom_message.append(dom_txt);
            dom_message.append(dom_btn);
            //finally: set isuptodate property + add/remove warning message
            this.isuptodate = false;
            this.addMessage(dom_message, "outdated", "warning");
        } else {
            this.removeMessage("outdated");
            this.isuptodate = true;
        }
    }


    // ************************************************************************
    // management of messages including error messages
    addThreePartsErrorMessage(key_part1, text_part2, key_part3, id) {
        const msg = document.createElement("div");
        const span1 = document.createElement("span"); 
        bamI.set(span1).key(key_part1).text().apply();
        const span2 = document.createElement("span"); 
        span2.textContent = text_part2;
        const span3 = document.createElement("span"); 
        bamI.set(span3).key(key_part3).text().apply();
        msg.append(span1)
        msg.append(span2)
        msg.append(span3)
        this.addMessage(msg, id)
    }
    addMessage(message, id, type="error") {
        this.removeMessage(id);
        const msg = document.createElement("div");
        msg.setAttribute(type, "");
        msg.id = id;
        if (message instanceof HTMLElement) {
            msg.append(message);
        } else if (typeof message === "string") {
            bamI.set(msg).key(message).text().apply();
        }
        this.dom_messages.append(msg);
        this.dom_messages.removeAttribute("hidden");
    }
    removeMessage(id) {
        const msg = this.dom_messages.querySelector("#"+id);
        if (msg) {
            msg.remove();
        }
        if (this.dom_messages.childElementCount === 0) {
            this.dom_messages.setAttribute("hidden", "");
        }
    }
    clearMessages(type=null) {
        if (!type) {
            this.dom_messages.innerHTML = "";
        } else {
            const dom_messages_to_remove = this.dom_messages.querySelectorAll('['+type+']');
            for (let msg of dom_messages_to_remove) {
                msg.remove();
            }
        }
        if (this.dom_messages.childElementCount === 0) {
            this.dom_messages.setAttribute("hidden", "");
        }
    }
    // ************************************************************************
    // Properties (defines what happend when a property is accessed or changed)

    set isuptodate(val) {
        if (val) {
            this.dom_wrapper.removeAttribute("oudated")
        } else {
            this.dom_wrapper.setAttribute("oudated", "")
        }
    }
    get isuptodate() {
        return !this.dom_wrapper.hasAttribute("oudated");
    }
    set isvalid(val) {
        if (val) {
            this.dom_wrapper.removeAttribute("invalid")
        } else {
            this.dom_wrapper.setAttribute("invalid", "")
        }
    }
    get isvalid() {
        return !this.dom_wrapper.hasAttribute("invalid");
    }
    set hidden(val) {
        if (val) {
            this.dom_wrapper.setAttribute("hidden", "")
        } else {
            this.dom_wrapper.removeAttribute("hidden")
        }
    }
    get hidden() {
        return this.dom_wrapper.hasAttribute("hidden");
    }
    set maximized(val) {
        if (val) {
            this.dom_wrapper.setAttribute("maximized", "")
        } else {
            this.dom_wrapper.removeAttribute("maximized")
        }
        if (this.onMaximizedCallback) this.onMaximizedCallback();
    }
    get maximized() {
        return this.dom_wrapper.hasAttribute("maximized");
    }

    // FIXME: obsolete but still used thoughout the code
    // I should use property isvalid instead
    set validated(val) {
        if (val) {
            this.dom_wrapper.removeAttribute("invalid")
        } else {
            this.dom_wrapper.setAttribute("invalid", "")
        }
    }
    get validated() {
        return !this.dom_wrapper.hasAttribute("invalid");
    }

    // obsolete
    // set minimized(val) {
    //     if (val) {
    //         this.dom_wrapper.setAttribute("minimized", "")
    //     } else {
    //         this.dom_wrapper.removeAttribute("minimized")
    //     }
    // }
    // get minimized() {
    //     return this.dom_wrapper.hasAttribute("minimized");
    // }

}