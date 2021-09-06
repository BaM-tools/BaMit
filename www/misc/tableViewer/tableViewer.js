// import "./tableViewer.css"
// export default class TableViewer {
class TableViewer {
    constructor(data) {
        // retrieve data structure
        this.headers = Object.keys(data)
        this.ncol = this.headers.length
        this.nrow = data[this.headers[0]] ? data[this.headers[0]].length : 0
        this.row_numbers = Array(this.nrow).fill(0).map((e, i)=>i+1)
        const MAX_CELL = 1000
        this.n_data = this.ncol * this.nrow
        this.max_row_per_page = this.nrow - 1
        console.log(this.n_data)
        if (this.n_data > MAX_CELL) {
            this.max_row_per_page = 10
            // if (MAX_CELL / this.ncol > 10) {
                this.max_row_per_page = Math.floor(MAX_CELL / this.ncol)
            // } 
        }
        console.log(this.max_row_per_page)
        console.log(this.nrow)
        console.log(this.row_numbers)
        console.log(this.ncol)


        // containers
        this.dom = document.createElement("div")
        this.dom.className = "table-viewer-main"
        this.dom_data = document.createElement("div")
        this.dom_data.className = "table-viewer-data"
        // this.dom_footer = document.createElement("div")
        // this.dom_footer.className = "table-viewer-footer"

        this.dom.append(this.dom_data)
        this.footer = new TableViewerFooter(this.nrow, this.max_row_per_page)
        this.dom.append(this.footer.get())

        // headers & row numbers container
        this.dom_header = document.createElement("div")
        this.dom_header.className = "table-viewer-headers"
        this.dom_row_numbers = document.createElement("div")
        this.dom_row_numbers.className = "table-viewer-row-numbers"
        this.dom_topleft_corner = document.createElement("div")
        this.dom_topleft_corner.className = "table-viewer-topleft-corner"

        // table container
        this.dom_table = document.createElement("div")
        this.dom_table.className = "table-viewer-table"
        
        // append to main container
        this.dom_data.append(this.dom_table)
        this.dom_data.append(this.dom_row_numbers)
        this.dom_data.append(this.dom_header)
        this.dom_data.append(this.dom_topleft_corner)

        // default column size is max-content
        this.dom_header.style.gridTemplateColumns = "max-content ".repeat(this.ncol+1)
        this.dom_table.style.gridTemplateColumns = "max-content ".repeat(this.ncol+1)

        // header cells
        this.header_cells = Array(this.ncol)
        for (let j = 0; j < this.ncol; j++) {
            let cell = createHeaderCell(this.headers[j])
            cell.setAttribute("col", j)
            this.header_cells[j] = cell
            this.dom_header.append(cell)
        }
        // row number cells
        this.row_number_cells = Array(this.nrow)
        for (let i=0; i < this.nrow; i++) {
            let row_number_cell = createRowNumberCell(this.row_numbers[i])
            row_number_cell.setAttribute("row", i)
            this.row_number_cells[i] = row_number_cell
            // this.dom_row_numbers.append(row_number_cell)
        }
        // table cells
        // this.table_cells = Array(this.ncol).fill(0).map(e=>Array(this.nrow))
        // for (let i=0; i < this.nrow; i++) {
        //     let odd = i%2?false:true
        //     for (let j = 0; j < this.ncol; j++) {
        //         let cell = createContentCell(data[this.headers[j]][i])
        //         cell.setAttribute("row", i)
        //         cell.setAttribute("col", j)
        //         if(odd) cell.setAttribute("odd", true)
        //         this.table_cells[j][i] = cell
        //         // this.dom_table.append(cell)
        //     }
        // }
        console.log("this.row_number_cells", this.row_number_cells)
        // console.log("this.table_cells", this.table_cells)

        // add scroll listener
        this.dom_data.addEventListener("scroll", (e) => {
            let top = this.dom_data.scrollTop
            let left = this.dom_data.scrollLeft
            this.dom_header.style.transform = `translateY(${top}px)`
            this.dom_row_numbers.style.transform = `translateX(${left}px)`
            this.dom_topleft_corner.style.transform = `translate(${left}px, ${top}px)`
        })


        // for (let i=0; i < this.nrow; i++) {
        //     let odd = i%2?false:true
        //     for (let j = 0; j < this.ncol; j++) {
        //         let cell = createContentCell(data[this.headers[j]][i])
        //         cell.setAttribute("row", i)
        //         cell.setAttribute("col", j)
        //         if(odd) cell.setAttribute("odd", true)
        //         this.table_cells[j][i] = cell
        //         // this.dom_table.append(cell)
        //     }
        // }



        // handle page change
        this.footer.setOnChange((range) => {
            console.log("range", range)

            this.dom_row_numbers.innerHTML = ""
            this.dom_table.innerHTML = ""
            this.table_cells = Array(this.ncol).fill(0).map(e=>Array(range.end - range.start))
            let k = 0
            // row number cells
            for (let i=range.start-1; i < range.end; i++) {
                
                let odd = i%2?false:true
                this.dom_row_numbers.append(this.row_number_cells[i])
                for (let j = 0; j < this.ncol; j++) {
                    let cell = createContentCell(data[this.headers[j]][i])
                    cell.setAttribute("row", i)
                    cell.setAttribute("col", j)
                    if(odd) cell.setAttribute("odd", true)
                    this.table_cells[j][k] = cell

                    this.dom_table.append(cell)
                }
                k++
            }
            this.update()
        })

        this.footer.update()

    }

    set(parent, maxHeight) {
        this.dom.style.maxHeight = `${maxHeight}px`;
        this.dom_data.style.maxHeight = `${maxHeight - 50}px`;
        parent.append(this.dom)
        this.update()
        
    }

    update() {
        // update the size (FIXME: only trigger when first rendered?)
        const data_elements = this.header_cells.map((e, i) => {
            return [e, ...this.table_cells[i]]
        })
        console.log("data_elements", data_elements)
        getSizes(data_elements).then((col_sizes, row_sizes) => {
            let gridTemplateColumn =  col_sizes.reduce((p, c)=>`${p} ${c}px`, "")
            this.dom_header.style.gridTemplateColumns = gridTemplateColumn
            this.dom_table.style.gridTemplateColumns = gridTemplateColumn
            
            const offset = "75px"
            this.dom_table.style.paddingLeft = offset
            this.dom_header.style.paddingLeft = offset
            this.dom_row_numbers.style.gridTemplateColumns = offset
            this.dom_topleft_corner.style.width = offset
            
        })
    }
}



function createHeaderCell(content) {
    const div = document.createElement("div")
    div.innerHTML = content
    div.className = "table-viewer-header-cell"
    return div
}
function createContentCell(content){
    const div = document.createElement("div")
    div.innerHTML = content
    div.className = "table-viewer-content-cell"
    return div
}
function createRowNumberCell(content) {
    const div = document.createElement("div")
    div.innerHTML = content
    div.className = "table-viewer-rownumber-cell"
    return div
}

/**
 * @description Return a promise which resolve into an array containing the default column sizes.
 * It uses `window.requestAnimationFrame` to retrieve the max-content computed size of the columns
 * and the default height of each row.
 * @param {Array} elements An array containings arrays of the elements of each columns
 * @author Ivan Horner
 */
async function getSizes(elements) {
    return new Promise((resolve, reject) => {
        let start;
        let n = 0
        const reqAniFrmFn = (timestamp) => {
            if (timestamp > start) {
                let col_sizes = Array(elements.length).fill().map(e=>Array(elements[0].length))
                let row_sizes = elements[0] ? Array(elements[0].length).fill().map(e=>Array(elements.length)) : Array()
                for (let i = 0; i < elements.length; i++) {
                    for (let j = 0; j < elements[0].length; j++) {
                        let bound = elements[i][j].getBoundingClientRect()
                        col_sizes[i][j] = bound.width
                        row_sizes[j][i] = bound.height
                    }
                }
                col_sizes = col_sizes.map(c=>{
                    return Math.max(...c)
                })
                row_sizes = row_sizes.map(c=>{
                    return Math.max(...c)
                })
                console.log("col_sizes", col_sizes)
                console.log("row_sizes", row_sizes)
                resolve(col_sizes, row_sizes)
            } else {
                n++
                if (n>10) {
                    reject("Too many iteration...")
                } else {
                    window.requestAnimationFrame(reqAniFrmFn)
                }
            }
        }
        window.requestAnimationFrame((timestamp) => {
            start = timestamp
            reqAniFrmFn(timestamp)
        })
    })
}


class TableViewerFooter {
    constructor(nrow, rows_per_page) {
        this.dom = document.createElement("div")
        this.dom.className = "table-viewer-footer"

        // N Rows per page: 5 rows per page
        // Current row range: 15-20 / 500
        // set starting row: 15
        // next / previous

        this.dom_previous = document.createElement("button")
        this.dom_previous.textContent = "<"
        this.dom_next = document.createElement("button")
        this.dom_next.textContent = ">"

        this.dom_start = document.createElement("input")
        this.dom_start.type = "number"
        this.dom_start.min = 1
        this.dom_start.max = nrow - rows_per_page
        this.dom_start.step = 1
        this.dom_start.value = 1

        this.dom_end = document.createElement("span")
        this.dom_end.textContent = ` - ${1 + rows_per_page} / ${nrow}`

        this.dom.append(this.dom_previous)
        this.dom.append(this.dom_start)
        this.dom.append(this.dom_end)
        this.dom.append(this.dom_next)

        this.onChangeCallback = () => {}
        // state
        this.state = {
            start: 1,
            end: 1 + rows_per_page,
            n: rows_per_page,
            max: nrow,
        }

        console.log("this.state", this.state)
        const applyChange = (start) => {
            if (start < 1) start = 1
            if (start > this.state.max - this.state.n) start = this.state.max - this.state.n
            this.dom_start.value = start
            if (start !== this.state.start) {
                this.state.start = start
                this.state.end = start + this.state.n

                console.log("this.state", this.state)
                this.update()
            }
        }
        this.dom_start.addEventListener("change", () => {
            let start = parseInt(this.dom_start.value)
            applyChange(start)
        })
        this.dom_previous.addEventListener("click", () => {
            let start = this.state.start - this.state.n
            applyChange(start)
        })
        this.dom_next.addEventListener("click", () => {
            let start = this.state.start + this.state.n
            applyChange(start)
        })
    }
    setOnChange(callback) {
        this.onChangeCallback = callback
    }
    update() {
        this.onChangeCallback(this.state)
        this.dom_end.textContent = ` - ${this.state.end} / ${this.state.max}`
    }
    get() {
        return this.dom
    }
}
