class bamMonitoring {
    constructor(testy=false) {
        this.testy=testy
        this.dom_wrapper = document.createElement("div");
        this.dom_wrapper.className = "bam-running";

        const dom_pb_text = document.createElement("div");
        dom_pb_text.id = "pb-txt";
        this.dom_wrapper.append(dom_pb_text);
        const dom_pb_container = document.createElement("div");
        dom_pb_container.id = "pb-container";
        this.dom_wrapper.append(dom_pb_container);
        const dom_pb = document.createElement("div");
        dom_pb.id = "pb";
        dom_pb_container.append(dom_pb);

        this.bamMsg = null;
        this.startTime = null;

        Shiny.addCustomMessageHandler("bam_monitoring_calibration", (data) => {
            if (data.i === -1) {   
                if (this.bamMsg) this.bamMsg.destroy(0);
                this.bamMsg = null;
                this.onBaMcalibrationDone(false)
                new bamMessage({
                    message: bamI.getText("run_calib_error"),
                    type: "error",
                    timeout: 5000,
                }) 
                return;
            } else if (data.i === 0) {                
                this.initMoniroting()
            } else if (data.i === 100) {
                // destroy monitoring message
                this.bamMsg.destroy(0);
                this.bamMsg = null;
                this.onBaMcalibrationDone()
                return;
            } else {
                dom_pb_text.textContent = bamI.getText("run_isrunning") + ": " + Math.round(data.i) + "%";
                dom_pb.style.width = Math.round(data.i) + "%"
            }
            setTimeout(function() {
                data.r = Math.random(); // to make sure message is sent.
                // Shiny.setInputValue("bam_monitoring_calibration", data)
                Shiny.onInputChange("bam_monitoring_calibration", data)
            }, 250)
        })

        Shiny.addCustomMessageHandler("bam_monitoring_prediction", (data) => {
            if (data.i === 0) {                
                this.initMoniroting()
            } else if (data.i === 100) {
                dom_pb_text.textContent = bamI.getText("run_isrunning") + ": " + Math.round(data.i) + "% (" + bamI.getText("run_isrunning_envelops") + ")";
                dom_pb.style.width = Math.round(data.i) + "%"
            } else if (data.i === 101) {
                // destroy monitoring message
                this.bamMsg.destroy(0);
                this.bamMsg = null;
                this.onBaMpredictionDone(data.config)
                return;
            } else {
                dom_pb_text.textContent = bamI.getText("run_isrunning") + ": " + Math.round(data.i) + "%";
                dom_pb.style.width = Math.round(data.i) + "%"
            }
            setTimeout(function() {
                data.r = Math.random(); // to make sure message is sent.
                // Shiny.setInputValue("bam_monitoring_prediction", data)
                Shiny.onInputChange("bam_monitoring_prediction", data)
            }, 250)
        })

    }

    initMoniroting() {
        this.bamMsg = new bamMessage({
            type: "info",
            custom: this.dom_wrapper,
            auto_destroy: false
        })
        this.startTime = performance.now()
    }

}
