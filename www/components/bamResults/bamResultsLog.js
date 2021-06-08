class bamResultsLog{
    constructor() {
        this.dom_content = document.createElement("div");
        this.dom_content.className = "bam-results-log";

        this.dom_log_container = document.createElement("div");
        this.dom_log_container.className = "log-container"
        this.dom_content.append(this.dom_log_container)
    }
    getDOM() {
        return this.dom_content;
    }
    get() {
        return this.log;
    }
    set(config) {
        this.log = config;
        this.dom_log_container.innerHTML = "";
        for (let line of config) {
            const p = document.createElement("p")
            p.textContent = line;
            this.dom_log_container.append(p);
        }
    }
}

