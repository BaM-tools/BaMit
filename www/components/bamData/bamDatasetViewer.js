/**
 * @description
 * Dataset viewer. Given a dataset and a parent DOM element, it creates a 
 * table HTML element to display the content of the dataset.
 * 
 * @argument dataset a dataset object which contains two element: a name element and a data element.
 * The data element is an object where each element is one column of the dataset as an array
 * Note that all elements/arrays should have the same length.
 * @argument parent a parent DOM element (typically a div element)
 * 
 * @author Ivan Horner
 */
class bamDatasetViewer {
    constructor(dataset, parent, onCloseCallback=null) {

        // main wrapper
        this.dom_wrapper = document.createElement("div");
        this.dom_wrapper.className = "bam-dataset-viewer";
        this.dom_wrapper.dataset_name = dataset.name; // keep the name of the dataset stored

        // box shadow overlay (obsolete?)
        const dom_shadow = document.createElement("div")
        this.dom_wrapper.append(dom_shadow)
        dom_shadow.className = "shadow"
        // dom_shadow.onmouse

        // title div containing dataset filename + button to destroy the viewer
        const dom_title = document.createElement("div");
        dom_title.className = "title";
        const dom_name = document.createElement("div");
        dom_name.className = "name";
        dom_name.textContent = dataset.name;
        const dom_destroy = document.createElement("button");
        dom_destroy.className = "bam-btn-simple";
        // dom_destroy.textContent = "close";
        bamI.set(dom_destroy).key("datasets_viewer_close").text().apply();
        dom_destroy.addEventListener("click", function() {
            if (onCloseCallback) onCloseCallback();
            this.parentElement.parentElement.remove();
        })
        dom_title.append(dom_name);
        dom_title.append(dom_destroy);

        // const dom_data = this.divVersion(dataset);


        this.dom_wrapper.append(dom_title);
        // this.dom_wrapper.append(dom_data);

        
        const table_viewer = new TableViewer(dataset.data)
        table_viewer.set(this.dom_wrapper, 400)

        parent.append(this.dom_wrapper);

        
        
    }

    divVersion(dataset) {
        const dom_data = document.createElement("div");
        dom_data.className = "dataset-table-main"
        let keys = Object.keys(dataset.data);
        // header table
        const dom_table_header = document.createElement("div");
        dom_table_header.className = "dataset-table-header";
        const widths = Array(keys.length)
        for (let j = 0; j < keys.length; j++) {
            let dom_cell = document.createElement("div");
            dom_cell.className = "cell"
            dom_cell.textContent = keys[j];
            dom_cell.title = keys[j];
            widths[j] = 100 / keys.length
            dom_cell.style.width = widths[j] + "%";
            dom_table_header.append(dom_cell);
        }
        dom_data.append(dom_table_header);

        // to resize header column according to body column size
        // this will only work to some extent and won't be supported by
        // old browser or Edge for examples
        // var ro;
        // if (typeof ResizeObserver === "function") {
        //     ro = new ResizeObserver(entries => {
        //         const tds = dom_table_header_tr.querySelectorAll("td")
        //         for (let e of entries) {
        //             let k = +e.target.id;
        //             tds[k].style.width = e.contentRect.width + "px";
        //         }
        //     })
        // }

        // body table
        const dom_table_data = document.createElement("div");
        dom_table_data.className = "dataset-table-data";
        const n_data_to_display = Math.min(dataset.data[keys[0]].length, 50);
        // for (let i = 0; i < dataset.data[keys[0]].length; i++) {
        for (let i = 0; i < n_data_to_display; i++) {
            let dom_row = document.createElement("div");
            dom_row.className = "row";
            for (let j = 0; j < keys.length; j++) {
                let dom_cell = document.createElement("div");
                dom_cell.className = "cell"
                dom_cell.textContent = dataset.data[keys[j]][i];
                dom_cell.title = dataset.data[keys[j]][i],
                dom_cell.style.width = widths[j] + "%";
                dom_row.append(dom_cell);
                // if (i === 0 && ro) {
                //     td.id = j;
                //     ro.observe(td)
                // }
            }
            dom_table_data.append(dom_row);
        }
        dom_data.append(dom_table_data);

        return dom_data;
    }


    tableVersion(dataset) {
        const dom_data = document.createElement("div");
        dom_data.id = "data";
        let keys = Object.keys(dataset.data);
        // header table
        const dom_table_header = document.createElement("table");
        dom_table_header.className = "data-header";
        const dom_table_header_tr = document.createElement("tr");
        for (let j = 0; j < keys.length; j++) {
            let td = document.createElement("td");
            td.textContent = keys[j];
            td.style.width = 100 / keys.length + "%";
            dom_table_header_tr.append(td);
        }
        dom_table_header.append(dom_table_header_tr);
        dom_data.append(dom_table_header);

        // to resize header column according to body column size
        // this will only work to some extent and won't be supported by
        // old browser or Edge for examples
        var ro;
        if (typeof ResizeObserver === "function") {
            ro = new ResizeObserver(entries => {
                const tds = dom_table_header_tr.querySelectorAll("td")
                for (let e of entries) {
                    let k = +e.target.id;
                    tds[k].style.width = e.contentRect.width + "px";
                }
            })
        }

        // body table
        const dom_table_data = document.createElement("table");
        dom_table_data.className = "data-table";
        const n_data_to_display = Math.min(dataset.data[keys[0]].length, 50);
        // for (let i = 0; i < dataset.data[keys[0]].length; i++) {
        for (let i = 0; i < n_data_to_display; i++) {
            let tr = document.createElement("tr");
            for (let j = 0; j < keys.length; j++) {
                let td = document.createElement("td");
                td.textContent = dataset.data[keys[j]][i];
                td.style.width = 100 / keys.length + "%";
                tr.append(td);
                if (i === 0 && ro) {
                    td.id = j;
                    ro.observe(td)
                }
            }
            dom_table_data.append(tr);
        }
        dom_data.append(dom_table_data);

        return dom_data;
    }

}