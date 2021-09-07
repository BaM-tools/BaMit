class bamResultsParameters {
    constructor() {

        this.dom_content = document.createElement("div");
        this.dom_content.classList.add("bam-results-parameters")

        this.dom_panel_config = document.createElement("div");
        this.dom_panel_config.classList.add("par-config");
        this.dom_content.append(this.dom_panel_config);

        // FIXME: this could also be implemented as a tab system (but horizontal instead of vertical)
        //        the tab system (bamTabs.js) should therefore be more generic if used here as well.
        // select density or trace plots
        const dom_trace_btn = document.createElement("div");
        dom_trace_btn.classList.add("select-btn")
        bamI.set(dom_trace_btn).key("display_trace").text().apply();
        dom_trace_btn.setAttribute("selected", "")
        dom_trace_btn.addEventListener("click", () => {
            if (!dom_trace_btn.hasAttribute("selected")) {
                this.plotTrace();
                dom_trace_btn.setAttribute("selected", "")
                dom_density_btn.removeAttribute("selected")

            }
        })
        this.dom_panel_config.append(dom_trace_btn)
        const dom_density_btn = document.createElement("div");
        dom_density_btn.classList.add("select-btn")
        bamI.set(dom_density_btn).key("display_density").text().apply();
        dom_density_btn.addEventListener("click", () => {
            if (!dom_density_btn.hasAttribute("selected")) {
                this.plotDensity();
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
    getDOM() {
        return this.dom_content;
    }
    update(trace, density) {
        // useless?
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
        this.data_trace = config.trace;
        this.data_density = config.density;
        this.parameters = Object.keys(this.data_trace).filter((e)=>e!="LogPost")
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
}

