plot = function() {
    var width = 100;
    var height = 70;
    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    }

    var parent;
    var container;
    var content;

    var x;
    var y;

    function plot() {
        
        // define the width and height of plot region
        const w = width  - margin.left - margin.right;
        const h = height - margin.top  - margin.bottom;

        // create the scales
        const xScale = d3.scaleLinear().range([0, w]).nice();
        const yScale = d3.scaleLinear().range([h, 0]).nice();

        // create the svg container (i.e. plot region + margins)
        const plt = d3.create("svg")
            .attr("viewBox", [0, 0, w + margin.left + margin.right, h + margin.top + margin.bottom])

        // create the group that will contain the plot region
        container = plt.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // define scale domaine
        if (x) xScale.domain([d3.min(x), d3.max(x)])
        if (y) yScale.domain([d3.min(y), d3.max(y)])


        if (content) {
            content(container, x, y, xScale, yScale)
        }

        // add the axis to the plot3
        if (x) {
            const xAxis = container.append("g")
                .attr("transform", "translate(0, " + h + ")")
                .call(d3.axisBottom(xScale))
            console.log([d3.min(x), d3.max(x)])
        }
        if (y) {
            const yAxis = container.append("g")
                .call(d3.axisLeft(yScale))
        }

        // set parent
        if (parent) parent.append(plt.node());
    }

    // getter/setter: width
    plot.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return plot;
    }
    // getter/setter: height
    plot.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return plot;
    }
    // getter/setter: margin
    plot.margin = function(value) {
        if (!arguments.length) return margin;
        for (let m in value) {
            margin[m] = value[m];
        }
        return plot;
    }
    // getter/setter: x
    plot.x = function(value) {
        if (!arguments.length) return x;
        // value must be a list of length N with each element an array of length 2
        x = value;
        return plot;
    }
    // getter/setter: y
    plot.y = function(value) {
        if (!arguments.length) return y;
        // value must be a list of length N with each element an array of length 2
        y = value;
        return plot;
    }
    // getter/setter: plot DOM parent
    plot.parent = function(value) {
        if (!arguments.length) return parent;
        parent = value;
        return plot;
    }
    //getter/setter: plot content
    plot.content = function(callback) {
        if (!arguments.length) return content;
        content = callback
        return plot;
    }
    // action: draw plot
    plot.plot = function() {
        plot();
        return plot;
    }
    return plot;
}


plotLine = function() {
    var width = 100;
    var height = 70;
    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    }

    var parent;

    var dataset = [[0, 0]];

    var updateData;
    var updateParent;
    
    var buildInspector;

    function plot() {
        
        // define the width and height of plot region
        const w = width  - margin.left - margin.right;
        const h = height - margin.top  - margin.bottom;

        // create the scales
        const xScale = d3.scaleLinear().range([0, w]).nice();
        const yScale = d3.scaleLinear().range([h, 0]).nice();

        // create the svg container (i.e. plot region + margins)
        const plt = d3.create("svg")
            .attr("viewBox", [0, 0, w + margin.left + margin.right, h + margin.top + margin.bottom])

        // create the group that will contain the plot region
        const plt_content = plt.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // define scale domaine
        xScale.domain([d3.min(dataset, (d) => d[0]), d3.max(dataset, (d) => d[0])])
        yScale.domain([d3.min(dataset, (d) => d[1]), d3.max(dataset, (d) => d[1])])

        // create the D3 line object
        let theLine = d3.line()
            .x((d) => xScale(d[0]))
            .y((d) => yScale(d[1]))

        // add a SVG path to the plot content
        const path = plt_content.append("path")
            // .data([dataset])
            .datum(dataset)
            .attr("fill", "none")
            .attr("stroke", "rgb(100, 100, 100)")
            .attr("d", theLine)

        // add the axis to the plot
        const xAxis = plt_content.append("g")
            .attr("transform", "translate(0, " + h + ")")
            .call(d3.axisBottom(xScale))
        const yAxis = plt_content.append("g")
            .call(d3.axisLeft(yScale))

        // add node tree to parent
        if (parent) parent.append(plt.node())
        updateData = function() {

            // define the new scale domaine
            xScale.domain([d3.min(dataset, (d) => d[0]), d3.max(dataset, (d) => d[0])])
            yScale.domain([d3.min(dataset, (d) => d[1]), d3.max(dataset, (d) => d[1])])

            // create a transition
            var t = d3.transition().duration(500);

            // create the new line object
            theLine = d3.line()
            .x((d) => xScale(d[0]))
            .y((d) => yScale(d[1]))
            // ... and change the path
            // path.data([dataset]).transition(t)
            path.datum(dataset).transition(t)
                // .attr("fill", "none")
                // .attr("stroke", "black")
                .attr("d", theLine)
            
            // update the actual axis
            xAxis.transition(t).call(d3.axisBottom(xScale))
            yAxis.transition(t).call(d3.axisLeft(yScale))

        }

        updateParent = function() {
            parent.append(plt.node())
        }
    
        buildInspector = function() {
            const tooltip = plotTooltip()
                .parent(plt_content)
                .plot()

            plt.on("mousemove", function(e) {
                e.preventDefault();
                e.stopPropagation();
                tooltip.show();
                const i = Math.floor(xScale.invert(d3.pointer(e, plt_content.node())[0]));
                const d = dataset[i];
                if (d) {
                    tooltip.update(
                        [
                            {name: "index", value: d[0]},
                            {name: "value", value: d[1]}
                        ],
                        {
                            x: xScale(d[0]),
                            y: yScale(d[1])
                        })
                }
            })
            document.addEventListener("mousemove", function(e) {
                tooltip.hide();
            })
            
        }
    }

    // getter/setter: width
    plot.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return plot;
    }
    // getter/setter: height
    plot.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return plot;
    }
    // getter/setter: margin
    plot.margin = function(value) {
        if (!arguments.length) return margin;
        for (let m in value) {
            margin[m] = value[m];
        }
        return plot;
    }
    // getter/setter: data
    plot.data = function(value) {
        if (!arguments.length) return dataset;
        // value must be a list of length N with each element an array of length 2
        dataset = value;
        if (typeof updateData === "function") updateData();
        return plot;
    }
    // getter/setter: plot DOM parent
    plot.parent = function(value) {
        if (!arguments.length) return parent;
        parent = value;
        if (typeof updateParent === "function") updateParent();
        return plot;
    }
    // action: draw plot
    plot.plot = function() {
        plot();
        return plot;
    }
    // action: add x/y lines to identify point on current x mouse position
    plot.inspector = function() {
        // if (!arguments.length) return buildInspector !== undefined;
        if (typeof buildInspector === "function") buildInspector();
        return plot;
    }
    return plot;
}

plotTooltip = function() {
    var data = [];
    var position = [];
    var parent;
    var box;

    tooltip = function() {
        const g = parent.append("g")
            .style("display", "none")
        const path = g.append("rect")
            .attr("fill", "white")
            .attr("stroke", "darkorange")
            .attr("rx", 2)
        const text = g.append("text")
            .attr("font-size", "8")
        const point = parent.append("circle")
            .attr("r", 3)
            .attr("stroke", "none")
            .attr("fill", "darkorange")
            .style("display", "none")
        update = function() {
            text.selectAll("tspan")
                .data(data)
                .join("tspan")
                    .attr("x", 0)
                    .attr("y", (d, i) => `${i * 1.1}em`)
                    .text(d => d.name + ": " + d.value)


            // 
            // g.attr("transform", "translate(" + 0 + ", " + 0 + ")") 
            const bb = text.node().getBBox(); // {x, y, width, height}
            const margin = 5;
            if (position.x + bb.width > box.x + box.width) {
                offset =  - (bb.width + margin * 2);
            } else {
                offset = 0;
            }

            path.attr("x",  bb.x - margin)
                .attr("y", bb.y - margin)
                .attr("width", bb.width + margin * 2)
                .attr("height", bb.height + margin * 2)
            let x = position.x;
            let y = position.y;
            point.attr("cx", x).attr("cy", y)
            x += margin + offset;
            y += margin + bb.height/2;
            g.attr("transform", "translate(" + x + ", " + y + ")") 
        }

        show = function() {
            g.style("display", "block")
            point.style("display", "block")
        }
        hide = function() {
            g.style("display", "none")
            point.style("display", "none")
        }
    }
    tooltip.parent = function(value) {
        parent = value;
        box = parent.node().getBBox();
        return tooltip;
    }
    tooltip.update = function(dval, pval) {
        data = dval;
        position = pval;
        if (typeof update === "function") update();
        return tooltip;
    }
    tooltip.show = function() {
        if (typeof update === "function") show();
        return tooltip;
    }
    tooltip.hide = function() {
        if (typeof update === "function") hide();
        return tooltip;
    }
    tooltip.plot = function() {
        tooltip();
        return tooltip;
    }
    return tooltip;
}


plotDensity = function() {
    var width = 100;
    var height = 70;
    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    }
    var dataset = [[0, 0]];
    var steps = 5;
    var ticks = 50;
    var updateData;
    var mpindex = -1;

    // Functions to compute density
    // source: https://www.d3-graph-gallery.com/graph/density_basic.html
    function kernelDensityEstimator(kernel, X) {
        return function(V) {
            return X.map(function(x) {
                return [x, d3.mean(V, function(v) { return kernel(x - v); })];
            });
        };
    }
    function kernelEpanechnikov(k) {
        return function(v) {
            return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
        };
    }

    function plot(container) {
        
        // define the width and height of plot region
        const w = width  - margin.left - margin.right;
        const h = height - margin.top  - margin.bottom;

        // create the scales
        const xScale = d3.scaleLinear().range([0, w]).nice();
        const yScale = d3.scaleLinear().range([h, 0]).nice();

        // create the svg container (i.e. plot region + margins)
        const plt = d3.create("svg")
            .attr("viewBox", [0, 0, w + margin.left + margin.right, h + margin.top + margin.bottom])

        // create the group that will contain the plot region
        const plt_content = plt.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // define the x scale domaine
        var b = (d3.max(dataset) - d3.min(dataset)) * 0.05;
        xScale.domain([d3.min(dataset) - b, d3.max(dataset) + b])

        // compute the density
        var kde = kernelDensityEstimator(kernelEpanechnikov(steps), xScale.ticks(ticks));
        var density = kde(dataset);

        // define y scale domaine
        yScale.domain([0, d3.max(density, (d) => d[1])])

        // add borders to the new density
        var density_b = [[density[0][0], 0]];
        for (let k = 0; k < density.length; k++) {
            density_b.push(density[k]);
        }
        density_b.push([density[density.length - 1][0], 0]);

        // create the D3 line object
        let theLine = d3.line()
            // .curve(d3.curveBasis)
            .x((d) => xScale(d[0]))
            .y((d) => yScale(d[1]))

        // add a SVG path to the plot content
        const path = plt_content.append("path")
            .datum(density_b)
            .attr("fill", "rgb(220, 220, 220)")
            .attr("stroke", "rgb(100, 100, 100)")
            .attr("d", theLine)

        // add the maxpot to the plot
        const mpline = plt_content.append("g")
        if (mpindex >= 0) {
            mpline.selectAll("line").data([dataset[mpindex]])
                .enter().append("line")
                    .attr("x1", d => xScale(d))
                    .attr("x2", d => xScale(d))
                    .attr("stroke", "red")
                    .attr("y1", 0)
                    .attr("y2", h)
            mpline.selectAll("text").data([dataset[mpindex]])
                .enter().append("text")
                    .attr("font-size", "8")
                    .attr("text-anchor", "end")
                    .attr("fill", "red")
                    .attr("writing-mode", "tb")
                    .attr("x", d => xScale(d) + 6)
                    .attr("y", h - 4)
                    .text(d => `Maxpost: ${d}`)
        }
        // add the axis to the plot
        const xAxis = plt_content.append("g")
            .attr("transform", "translate(0, " + h + ")")
            .call(d3.axisBottom(xScale))
        const yAxis = plt_content.append("g")
            .call(d3.axisLeft(yScale))

        updateData = function() {
            // re-define the x scale domaine
            // xScale.domain([d3.min(dataset), d3.max(dataset)])
            
            b = (d3.max(dataset) - d3.min(dataset)) * 0.05;
            xScale.domain([d3.min(dataset) - b, d3.max(dataset) + b])

            // re-compute the density
            kde = kernelDensityEstimator(kernelEpanechnikov(steps), xScale.ticks(ticks));
            density = kde(dataset);
            // re-define y scale domaine
            yScale.domain([0, d3.max(density, (d) => d[1])])

            // add borders to the new density
            density_b = [[density[0][0], 0]];
            for (let k = 0; k < density.length; k++) {
                density_b.push(density[k]);
            }
            density_b.push([density[density.length - 1][0], 0]);

            // create a transition
            var t = d3.transition().duration(0);

            // create the new line object...
            theLine = d3.line()
                // .curve(d3.curveBasis)
                .x((d) => xScale(d[0]))
                .y((d) => yScale(d[1]))

            // ... and change the path
            // path.data([dataset]).transition(t)
            path.datum(density_b).transition(t)
                .attr("d", theLine)

            if (mpindex > -1) {
                mpline.selectAll("line").data([dataset[mpindex]]).transition(d3.transition().duration(250))
                    .attr("x1", d => xScale(d))
                    .attr("x2", d => xScale(d))
                mpline.selectAll("text").data([dataset[mpindex]]).transition(d3.transition().duration(250))
                    .attr("x", d => xScale(d) + 6)
                    .text(d => `Maxpost: ${d}`)
            }

            // update the actual axis
            xAxis.transition(t).call(d3.axisBottom(xScale))
            yAxis.transition(t).call(d3.axisLeft(yScale))

        }

        container.append(plt.node())
    }

    // getter/setter: width
    plot.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return plot;
    }
    // getter/setter: height
    plot.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return plot;
    }
    // getter/setter: margin
    plot.margin = function(value) {
        if (!arguments.length) return margin;
        for (let m in value) {
            margin[m] = value[m];
        }
        return plot;
    }
    // getter/setter: steps
    plot.steps = function(value) {
        if (!arguments.length) return steps;
        steps = value;
        return plot;
    }
    // getter/setter: ticks
    plot.ticks = function(value) {
        if (!arguments.length) return ticks;
        ticks = value;
        return plot;
    }
    // getter/setter: data
    plot.data = function(value) {
        if (!arguments.length) return dataset;
        // value must be a list of length N with each element an array of length 2
        dataset = value;
        if (typeof updateData === "function") updateData();
        return plot;
    }
    // getter/setter: data
    plot.maxpost = function(value) {
        if (!arguments.length) return mpindex;
        // value must be a list of length N with each element an array of length 2
        mpindex = value;
        // if (typeof addMaxPost === "function") addMaxPost();
        return plot;
    }

    return plot;
}