class bamTabs {
    constructor() {
        this.dom_main = document.createElement("div");
        this.dom_main.className = "bam-tabs";

        this.dom_tabulation_buttons = document.createElement("div");
        this.dom_tabulation_buttons.className = "bam-tabs-buttons"
        this.dom_main.append(this.dom_tabulation_buttons);

        this.dom_tabulation_content = document.createElement("div");
        this.dom_tabulation_content.className = "bam-tabs-content"
        this.dom_main.append(this.dom_tabulation_content);

        // to resize tab container height when content size changes
        // this won't be supported by old browser or Edge
        this.resizeObserver = null;
        if (typeof ResizeObserver === "function") {
            this.resizeObserver = new ResizeObserver(entries => {
                this.setContentHeight();
            })
        }

        this.tabulations = [];

    }
    setParent(parent) {
        parent.append(this.dom_main)
    }
    newTab() {
        const tab_btn = document.createElement("button");
        this.dom_tabulation_buttons.append(tab_btn);
        tab_btn.addEventListener("click", () => {
            if (!tab_btn.hasAttribute("opened")) {
                const btns = this.dom_tabulation_buttons.querySelectorAll("button");
                btns.forEach((btn) => {
                    btn.removeAttribute("opened");
                })
                tab_btn.setAttribute("opened", "");
                this.tabulations.forEach((tab) => {
                    tab.hide();
                })
                tab.show();
            }
        })

        const tab = new bamTab();
        tab.setParent(this.dom_tabulation_content)
        tab.setButton(tab_btn)
        if (this.resizeObserver) tab.setResizeObserver(this.resizeObserver);
        this.tabulations.push(tab)
        return tab;
    }
    setContentHeight() {
        let maxHeight = 0;
        this.tabulations.forEach(function(tab) {
            if (tab.isHidden()) {
                tab.show()
                if (tab.getHeight() > maxHeight) {
                    maxHeight = tab.getHeight()
                }
                tab.hide()
            } else {
                if (tab.getHeight() > maxHeight) {
                    maxHeight = tab.getHeight()
                }
            }            
        })
        this.dom_tabulation_content.style.height = maxHeight + "px";
    }
}

class bamTab {
    constructor() {
        this.dom_main = document.createElement("div");
        this.dom_main.className = "bam-tab";
        this.hide();
    }
    setParent(parent) {
        parent.append(this.dom_main)
    }
    setButton(button) {
        this.button = button;
    }
    getButton() {
        return this.button;
    }
    setContent(content) {
        this.dom_main.append(content);
    }
    // getContent() {
    //     return this.content;
    // }
    show() {
        this.dom_main.hidden = false;
        // this.dom_main.style.visibility = "visible";
    }
    hide() {
        this.dom_main.hidden = true;
        // this.dom_main.style.visibility = "hidden";
    }
    isHidden() {
        return this.dom_main.hidden;
    }
    getHeight() {
        return this.dom_main.clientHeight;
    }
    setResizeObserver(o) {
        o.observe(this.dom_main);
    }
}