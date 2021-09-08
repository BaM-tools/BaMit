class bamHelp {
    constructor() {

        this.dom_content_main = document.createElement("div");
        this.dom_content_main.className = "bam-help-main";
        const dom_content_header = document.createElement("div");
        dom_content_header.className = "bam-help-header";
        const dom_close_btn = document.createElement("button");
        bamI.set(dom_close_btn).key("close").text().apply();
        dom_close_btn.className = "bam-btn-simple";
        dom_close_btn.addEventListener("click", () => {
            this.hide();
            history.pushState("", document.title, window.location.pathname);
            // let a = document.createElement("a")
            // a.href = "#"
            // a.click();
            
        })
        this.dom_markedcontent = document.createElement("div");
        this.dom_markedcontent.className = "bam-help-content";
        this.marked_documents = { 
        }
        fetch("/help/Getting_started_fr.md").then(e=>e.text()).then(e=>{
            this.marked_documents["fr"] = marked(e);
        })

        dom_content_header.append(dom_close_btn);
        this.dom_content_main.append(dom_content_header);
        this.dom_content_main.append(this.dom_markedcontent);
        this.hide();
    }

    setParent(parent) {
        this.parent = parent;
    }
    show(language, goto_id) {
        if (this.parent) this.parent.append(this.dom_content_main);
        this.dom_content_main.style.display = "block";
        if (Object.keys(this.marked_documents).indexOf(language)===-1) language="fr"
        this.dom_markedcontent.innerHTML = this.marked_documents[language]
        this.dealWithImageSrc()
        if (goto_id) {
            const a = document.createElement("a")
            a.href =  `${window.location.origin}/#${goto_id}`
            a.click()
        }
    }
    hide() {
        if (this.parent) this.parent.removeChild(this.dom_content_main);
        this.dom_content_main.style.display = "none";
    }
    dealWithImageSrc() {
        const imgs = [...this.dom_markedcontent.querySelectorAll("img")]
        imgs.forEach(e=>e.src = e.src.replace("www/", ""))
    }
}