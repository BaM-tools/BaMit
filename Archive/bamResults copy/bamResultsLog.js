class bamResultsLog extends bamTabOLD{
    constructor(parent) {
        super(parent)
        this.dom_content = document.createElement("div");
        this.dom_content.classList.add("bam-results-tab-content-log")
        this.dom_main.append(this.dom_content);
        this.hide()
    }
    update(log) {
        this.dom_content.innerHTML = "";
        this.log = log;
        for (let l of log) {
            const p = document.createElement("p")
            p.textContent = l;
            this.dom_content.append(p);
        }
    }
    get() {
        return this.log;
    }
    set(config) {
        this.update(config)
    }
}

