class bamPlot {
    constructor() {
        this.zoom = 1;
        this.width = 200;
        this.height = 150;
        this.margin = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        }
        this.parent = null;
        this.x = null;
        this.y = null;

        this.svg = d3.create("svg");
    }

    plot() {
        // apply zoom;
        this.width = this.width / this.zoom
        this.height = this.height / this.zoom
        this.margin.top = this.margin.top / this.zoom
        this.margin.right = this.margin.right / this.zoom
        this.margin.bottom = this.margin.bottom / this.zoom
        this.margin.left = this.margin.left / this.zoom

        // define the width and height of plot region
        this.w = this.width  - this.margin.left - this.margin.right;
        this.h = this.height - this.margin.top  - this.margin.bottom;

        // create the scales
        this.xScale = d3.scaleLinear().range([0, this.w]).nice();
        this.yScale = d3.scaleLinear().range([this.h, 0]).nice();

        // create the svg container (i.e. plot region + margins)
        this.svg.attr("viewBox", [0, 0, this.w + this.margin.left + this.margin.right,
            this.h + this.margin.top + this.margin.bottom])

        // create the group that will contain the plot region
        this.container = this.svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        // define scale domaine
        this.xScale.domain([d3.min(this.x), d3.max(this.x)])
        this.yScale.domain([d3.min(this.y), d3.max(this.y)])

        // this.plot()

        this.axis();
        this.xAxis = this.container.append("g")
            .attr("transform", "translate(0, " + this.h + ")")
            .call(this.xAxisGen)
        this.yAxis = this.container.append("g")
            .call(this.yAxisGen)


        
    }

    axis() {
        // add the axis to the plot
        // this.xAxisGen = d3.axisBottom(this.xScale).ticks(5).tickFormat(d3.format(".1e"))
        // this.yAxisGen = d3.axisLeft(this.yScale).ticks(7).tickFormat(d3.format(".1e"))
        this.xAxisGen = d3.axisBottom(this.xScale)
        this.yAxisGen = d3.axisLeft(this.yScale)
    }
  
    

    setParent(parent) {
        this.parent = parent;
        this.parent.append(this.svg.node())
    }
    
    setX(x) {
        this.x = x;
    }
    setY(y) {
        this.y = y;
    }
    setZoom(zoom) {
        this.zoom = zoom;
    }
    setWidth(width) {
        this.width = width;
    }
    setHeight(height) {
        this.height = height;
    }
    setMargin(bottom, left, top, right) {
        this.margin = {top: top, right: right, bottom: bottom, left: left};
    }
}

class bamPlotTrace extends bamPlot {
    constructor() {
        super();
    }

    plot() {
        super.plot();
        // create dataset
        const dataset = [];
        for (let k = 0; k < this.x.length; k++) {
            dataset.push([this.x[k], this.y[k]])
        }

        // create the D3 line object
        let theLine = d3.line()
            .x((d) => this.xScale(d[0]))
            .y((d) => this.yScale(d[1]))

        // add a SVG path to the plot content
        this.container.append("path")
            // .data([dataset])
            .datum(dataset)
            .attr("fill", "none")
            .attr("stroke", "rgb(100, 100, 100)")
            .attr("d", theLine)
    }


    axis() {
        this.xAxisGen = d3.axisBottom(this.xScale).ticks(5)
        // this.yAxisGen = d3.axisLeft(this.yScale).ticks(7).tickFormat(d3.format(".2e"))
        this.yAxisGen = d3.axisLeft(this.yScale).ticks(7)
    }
}

class bamPlotDensity extends bamPlot {
    constructor() {
        super();
    }

    plot() {
        super.plot();
        // create dataset
        const dataset = [];
        for (let k = 0; k < this.x.length; k++) {
            dataset.push([this.x[k], this.y[k]])
        }

        // create the D3 line object
        let theLine = d3.line()
            .x((d) => this.xScale(d[0]))
            .y((d) => this.yScale(d[1]))

        // add a SVG path to the plot content
        this.container.append("path")
            // .data([dataset])
            .datum(dataset)
            .attr("fill", "none")
            .attr("stroke", "rgb(100, 100, 100)")
            .attr("d", theLine)

        // this.xAxis.selectAll(".tick text").style("text-anchor", "start").attr("transform", "rotate(15, -10, 10)")

        // this.activeTooltip()
    }

    // activeTooltip(activate=true)  {
    //     // const tooltip = document.createElement("div");
    //     // tooltip.style.position = "abolute";
    //     let self = this
    //     this.container.on("mousemove", function(e) {
    //         const ix = self.xScale.invert(d3.pointer(e, self.container.node())[0]);
    //         const iy = self.yScale.invert(d3.pointer(e, this)[1]);
    //         console.log(ix, iy)
    //     })
    //     // this.container.on("mouseleave", function(e) {
    //     //     const ix = self.xScale.invert(d3.pointer(e, self.container.node())[0]);
    //     //     const iy = self.yScale.invert(d3.pointer(e, self.container.node())[1]);
    //     //     console.log(ix, iy)
    //     // })
    // }
    
    axis() {
        console.log("here I have")
        this.xAxisGen = d3.axisBottom(this.xScale).ticks(4)
        this.yAxisGen = d3.axisLeft(this.yScale).ticks(0)
    }
}