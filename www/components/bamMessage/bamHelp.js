class bamHelp {
    constructor() {

        let self = this;

        this.dom_content_main = document.createElement("div");
        this.dom_content_main.className = "bam-help-main";
        const dom_content_header = document.createElement("div");
        dom_content_header.className = "bam-help-header";
        const dom_close_btn = document.createElement("button");
        dom_close_btn.textContent = "X";
        dom_close_btn.className = "bam-btn-simple";
        dom_close_btn.addEventListener("click", function() {
            self.hide();
        })
        const dom_markedcontent = document.createElement("div");
        dom_markedcontent.className = "bam-help-content";
        fetch("/help/Getting_started.md").then(e=>e.text()).then(e=>{
            dom_markedcontent.innerHTML = marked(e);
        })

        dom_content_header.append(dom_close_btn);
        this.dom_content_main.append(dom_content_header);
        this.dom_content_main.append(dom_markedcontent);
        this.hide();
    }

    setParent(parent) {
        this.parent = parent;
    }
    show() {
        if (this.parent) this.parent.append(this.dom_content_main);
        this.dom_content_main.style.display = "block";
    }
    hide() {
        if (this.parent) this.parent.removeChild(this.dom_content_main);
        this.dom_content_main.style.display = "none";
    }
}