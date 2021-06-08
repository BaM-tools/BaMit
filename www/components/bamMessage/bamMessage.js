/**
 * @description
 * A BaM message i.e. an absolute positioned DIV that comes on top of the UI for 
 * (1) information, warning or error message,
 * (2) simple yes/no questions or 
 * (3) custom message such as for requesting an input from the user.
 * Message can be temporary (it auto destroys after a few seconds) or need an action 
 * from the user to be destroyed.
 * Note that for yes / no question and custom message, the message include an underlying
 * DOM div that prevents the user to interact with the rest of 
 * page.
 * 
 * @argument config the configuration object of the message:
 *      message: string, the actual message
 *      type: string, the type of the message, "info", "warning" or "error"
 *      timeout: integer, the time in ms before autodestroy
 *      question: boolean, is it a yes/no question? default is false. 
 *      yes, no: functions, callbacks for the actions to take place when the user click yes or no.
 *      custom: HTMLElement, a DOM element containing the content of a custom message
 *              > an element contained within with a class "bam-message-focus" will get the focus.
 *              > an element contained within with a class "bam-message-destroy" will trigger the
 *                message destruction if clicked. Unless auto_destroy is true, there should always be
 *                an element that has this class!
 *              Note: 'message', 'question', 'yes', 'no' how no longer any effect if this is specified
 *      auto_destroy: boolean, whether the message should auto_destroy 
 *                    (different default behavior depending on the rest of the configuration)
 *      position: string, "center" or "bottom" to indicate where the message should appear in the browser
 * 
 * @author Ivan Horner
 */
class bamMessage {
    constructor(config) {

        // **********************************************************
        // first, let's remove any prior message
        let messages = document.body.querySelectorAll(".bam-message");
        if (messages.length > 0) {
            for (let k = 0; k < messages.length; k++) {
                document.body.removeChild(messages[k]);
            }
        }

        // **********************************************************
        // then, construct the new message
        this.dom_wrapper = document.createElement("div");
        this.dom_wrapper.className = "bam-message";
        this.dom_wrapper.setAttribute("type", "info");

        // **********************************************************
        // set the color (and other CSS stuff) according to the type of message
        if (config.type) {
            if (config.type == "warning") {
                this.dom_wrapper.setAttribute("type", "warning");
            } else if (config.type == "error") {
                this.dom_wrapper.setAttribute("type", "error");
            }
        }
        
        // **********************************************************
        // custom timeout
        if (!config.timeout && config.timeout != 0) config.timeout = 2000;

        // **********************************************************
        // custom message or simple message (only text or yes/no question)
        if (config.custom) { // if it's a custom message
            config = this.customMessage(config); 
        } else {
            config = this.simpleMessage(config); 
        }

        // **********************************************************
        // set the auto-destroy
        if (config.auto_destroy) this.destroy(config.timeout);
        // **********************************************************
        // add the message to the DOM tree
        document.body.appendChild(this.dom_wrapper);

        // **********************************************************
        // only for custom elements in case there is an element you want focus on, make sure it has class "bam-message-focus"
        let focus = this.dom_wrapper.querySelector(".bam-message-focus");
        if (focus) focus.focus();
    } 

    customMessage(config) {
        // by default, auto_destroy:
        if (Object.keys(config).indexOf("auto_destroy") === -1) config.auto_destroy = true;
        // by default, centered:
        this.dom_wrapper.setAttribute("center", "")
        if (config.position) this.dom_wrapper.setAttribute(config.position, "") 
        // look for any object expecting to desctroy message when  clicked
        const dom_destroyers = config.custom.querySelectorAll(".bam-message-destroy")
        let self = this;
        for (let k = 0; k < dom_destroyers.length; k++) {
            dom_destroyers[k].addEventListener("click", function() {
                self.destroy(0)
            })
        }
        // disable page
        this.createDisableDiv(); 
        // append to message
        this.dom_wrapper.append(config.custom);
        return config;
    }

    simpleMessage(config) {

        // **********************************************************
        config.auto_destroy = true; // by default, the message auto-destroy

        // **********************************************************
        // simple text content
        const dom_message = document.createElement("div");
        dom_message.id = "message";
        dom_message.textContent = config.message;
        this.dom_wrapper.appendChild(dom_message);

        if (config.position) {
            this.dom_wrapper.setAttribute(config.position, "")
        }

        // **********************************************************
        // if a yes / no question
        if (config.question) { // if it's a simple yes no question
            // by default, we center it ...
            config.auto_destroy = false;
            this.dom_wrapper.setAttribute("center", "")
            if (config.position) this.dom_wrapper.setAttribute(config.position, "") // overide default positioning for questions

            // ... and disable the page content by adding an overlapping div
            this.createDisableDiv();

            // then we add the YES and NO buttons
            const dom_yes_button = document.createElement("button");
            dom_yes_button.classList.add("bam-message-focus");
            bamI.set(dom_yes_button).key("yes").text().apply()
            const dom_no_button = document.createElement("button");
            bamI.set(dom_no_button).key("no").text().apply()
            this.dom_wrapper.appendChild(dom_yes_button);
            this.dom_wrapper.appendChild(dom_no_button);
            let self = this;
            dom_yes_button.addEventListener("click", function() {
                self.destroy(0);
                if (config.yes) config.yes(); // config.yes must be a callback
            });
            dom_no_button.addEventListener("click", function() {
                self.destroy(0);
                if (config.no) config.no(); // config.no must be a callback
            });
        }

        return config;
    }

    createDisableDiv() {
        this.deleteDisableDiv(); // get rid of any existing disabling div
        const dom_disabling_div = document.createElement("div");
        dom_disabling_div.className = "bam-message-disabling-div";
        document.body.appendChild(dom_disabling_div);
    }

    deleteDisableDiv() {
        const dom_disabling_div = document.querySelectorAll(".bam-message-disabling-div")
        for (let d of dom_disabling_div) {
            d.remove();
        }
    }

    destroy(timeout) {
        let self = this;
        setTimeout(function() {
            self.deleteDisableDiv();
            self.dom_wrapper.remove()
        }, timeout)

    }
}