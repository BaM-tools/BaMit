class bamFile {
    constructor(file, actions={}) {
        this.actions = actions
        this.file = file

        this.createDOM()
    }

    createDOM() {
        
        this.dom_container = document.createElement("div")
        this.dom_container.className = "bam-dataset-container"
        this.dom_left = document.createElement("div")
        this.dom_right = document.createElement("div")

        this.dom_container.append(this.dom_left)
        this.dom_container.append(this.dom_right)

        this.dom_icon = document.createElement("img")
        this.dom_icon.src = "/images/file.svg"
        this.dom_name = document.createElement("div")
        this.dom_name.className = "name"
        this.dom_name.textContent = this.file.name
        this.dom_size = document.createElement("div")
        this.dom_size.className = "size"
        this.dom_size.textContent = this.getFormattedSize()

        this.dom_left.append(this.dom_icon)
        this.dom_left.append(this.dom_name)
        // this.dom_left.append(this.dom_dim)
        this.dom_left.append(this.dom_size)

        if (this.actions.preview) {
            this.dom_preview_btn = document.createElement("button")
            this.dom_preview_btn.className = "bam-btn-simple"
            this.dom_preview_btn.addEventListener("click", this.actions.preview)
            bamI.set(this.dom_preview_btn).key("datasets_preview").text().attr("title").apply();
            // this.dom_preview_btn.innerHTML = "<img src=\"/images/preview.svg\"/>"
            this.dom_right.append(this.dom_preview_btn)
        }
        if (this.actions.download) {
            this.dom_download_btn = document.createElement("button")
            this.dom_download_btn.className = "bam-btn-simple"
            
            this.dom_download_btn.addEventListener("click", ()=>(
                this.actions.download instanceof Function ? this.actions.download() : this.download()
            ))
            bamI.set(this.dom_download_btn).key("datasets_download").text().attr("title").apply();
            // this.dom_download_btn.innerHTML = "<img src=\"/images/download.svg\"/>"
            this.dom_right.append(this.dom_download_btn)
        }
        if (this.actions.delete) {
            this.dom_delete_btn = document.createElement("button")
            this.dom_delete_btn.className = "bam-btn-simple"
            // this.dom_delete_btn.title = "bam-btn-simple"
            this.dom_delete_btn.addEventListener("click", this.actions.delete)
            bamI.set(this.dom_delete_btn).key("datasets_delete").text().attr("title").apply();
            // this.dom_delete_btn.innerHTML = "<img src=\"/images/delete.svg\"/>"
            this.dom_right.append(this.dom_delete_btn)
        }
    }

    getFormattedSize() {
        const units = ["o", "ko", "Mo", "Go"]
        const octets = this.file.size
        // const octets = bytes / 8
        let size = octets
        let unit = "o"
        let k = 0
        // I don't know if I should use SI prefixes or binary prefixes:
        // source: https://en.wikipedia.org/wiki/Octet_(computing)#Unit_multiples
        while (size > 500 && k < units.length-2) {
            size /= 1024
            k++;
            unit = units[k]
        }
        return ` (${size.toFixed(1)} ${unit})`
    }

    download() {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(this.file);
        a.download = this.file.name;
        a.click();               
    }

    getDOM() {
        return this.dom_container
    }
    removeDOM() {
        this.dom_container.remove()
    }
}