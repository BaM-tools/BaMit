class bamMonitoring {
    constructor() {
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

        let self = this;
        this.bamMsg = null;
        this.startTime = null;

        Shiny.addCustomMessageHandler("bam_monitoring_calibration", function(data) {
            // console.log(data);
            if (data.i === 0) {                
                self.initCalibrationMoniroting()
            } else if (data.i === 100) {
                // destroy monitoring message
                self.bamMsg.destroy(0);
                self.bamMsg = null;
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

        Shiny.addCustomMessageHandler("bam_monitoring_prediction", function(data) {
            // console.log(data);
            if (data.i === 0) {                
                self.initCalibrationMoniroting()
                dom_pb_text.textContent = bamI.getText("run_isrunning");
                dom_pb.style.width = 100 + "%"
            } else if (data.i === 100) {
                // destroy monitoring message
                self.bamMsg.destroy(0);
                self.bamMsg = null;
                return;
            } else {
                dom_pb_text.textContent = bamI.getText("run_isrunning");
                dom_pb.style.width = 100 + "%"
            }
            setTimeout(function() {
                data.r = Math.random(); // to make sure message is sent.
                // Shiny.setInputValue("bam_monitoring_prediction", data)
                Shiny.onInputChange("bam_monitoring_prediction", data)
            }, 250)
        })

        // calibration monitoring handler
        // Shiny.addCustomMessageHandler("bam_mcmc_monitoring_out", function(data) {
        //     if (!data.done) {
        //         // text and appearance of message
        //         dom_pb_text.textContent = bamI.getText("run_isrunning") + ": " + Math.round(data.i / data.n * 100) + "%";
        //         dom_pb.style.width = Math.round(data.i / data.n * 100) + "%"

        //         let timeout = 500; // interval for checking progress
        //         if (data.done) timeout = 0;
        //         data.r = Math.random() // randome value to make sure the message is sent out
        //         setTimeout(function() {
        //             Shiny.setInputValue("bam_mcmc_monitoring_in", data)
        //         }, timeout)
        //     } else {
        //         // self.dom_wrapper.remove(); // need this?
        //         self.bamMsg.destroy(0); // remove the monitoring user message
        //         self.bamMsg = null;
        //         console.log(data)
        //         if (self.onDoneCallback) self.onDoneCallback(data)
        //         console.log(" --> Time taken: " + (performance.now() - self.startTime) + " milliseconds.")
        //     }
        // })
    }

    initCalibrationMoniroting() {
        console.log("Starting monitoring")
        this.bamMsg = new bamMessage({
            type: "info",
            custom: this.dom_wrapper,
            auto_destroy: false
        })
        // this.onDoneCallback = onDoneCallback;
        this.startTime = performance.now()
    }

}
