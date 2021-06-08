class bamResultsParameters extends bamTabOLD {
    constructor(parent) {
        super(parent)
        this.dom_content = document.createElement("div");
        this.dom_content.classList.add("bam-results-tab-content-parameters")
        this.dom_main.append(this.dom_content);

        this.dom_panel_config = document.createElement("div");
        this.dom_panel_config.classList.add("par-config");
        this.dom_content.append(this.dom_panel_config);

        // select density or trace
        let self = this;
        const dom_trace_btn = document.createElement("div");
        dom_trace_btn.classList.add("select-btn")
        bamI.set(dom_trace_btn).key("display_trace").text().apply();
        // dom_trace_btn.textContent = "Affichier la trace"
        dom_trace_btn.setAttribute("selected", "")
        dom_trace_btn.addEventListener("click", function() {
            if (!dom_trace_btn.hasAttribute("selected")) {
                self.plotTrace();
                dom_trace_btn.setAttribute("selected", "")
                dom_density_btn.removeAttribute("selected")

            }
        })
        this.dom_panel_config.append(dom_trace_btn)
        const dom_density_btn = document.createElement("div");
        dom_density_btn.classList.add("select-btn")
        bamI.set(dom_density_btn).key("display_density").text().apply();
        // dom_density_btn.textContent = "Affichier la densité"
        dom_density_btn.addEventListener("click", function() {
            if (!dom_density_btn.hasAttribute("selected")) {
                self.plotDensity();
                dom_density_btn.setAttribute("selected", "")
                dom_trace_btn.removeAttribute("selected")
            }
        })
        this.dom_panel_config.append(dom_density_btn)

        this.dom_panel_plots = document.createElement("div");
        this.dom_panel_plots.classList.add("par-plots");
        this.dom_content.append(this.dom_panel_plots);

        this.parameters = [];

    }
    update(trace, density) {
        console.log(trace)
        console.log(density)
        // const logpost_trace = trace.LogPost
        this.parameters = Object.keys(trace).filter((e)=>e!="LogPost")
        console.log(this.parameters)
        this.data_trace = trace;
        this.data_density = density;
        this.dom_parameters = {};
        this.dom_panel_plots.innerHTML = "";
        for (let p of this.parameters) {
            this.dom_parameters[p] = document.createElement("div");
            this.dom_panel_plots.append(this.dom_parameters[p])
            const dom_par_name = document.createElement("div");
            dom_par_name.classList.add("par-name");
            dom_par_name.textContent = p;
            this.dom_parameters[p].append(dom_par_name);
            const dom_par_plot = document.createElement("div");
            dom_par_plot.classList.add("par-plot");
            this.dom_parameters[p].append(dom_par_plot);
        }

        this.plotTrace();

    }

    plotTrace() {
        for (let p of this.parameters) {
            const dom_plot = this.dom_parameters[p].querySelector(".par-plot")
            dom_plot.innerHTML = "";
            const plt = new bamPlotTrace();
            plt.setParent(dom_plot);
            plt.setMargin(20, 40, 20, 20);
            plt.setZoom(0.7)
            plt.setX(Array.from(Array(this.data_trace[p].length).keys()).map((e)=>e+1))
            plt.setY(this.data_trace[p])
            plt.plot()
        }
    }
    plotDensity() {
        for (let p of this.parameters) {
            const dom_plot = this.dom_parameters[p].querySelector(".par-plot")
            dom_plot.innerHTML = "";
            const plt = new bamPlotDensity();
            plt.setParent(dom_plot);
            plt.setMargin(20, 20, 20, 20);
            plt.setZoom(0.7)
            plt.setX(this.data_density[p].x)
            plt.setY(this.data_density[p].y)
            plt.plot()
        }
    }

    get() {
        return {
            trace: this.data_trace,
            density: this.data_density
        }
    }
    set(config) {
        this.update(config.trace, config.density)
    }
}

