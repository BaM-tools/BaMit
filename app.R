library(RBaM)
source(file.path(getwd(), "server", "RBaM_BaMit.R"))

server <- function(input, output, session) {
    # ===============================================================
    # Initialize session
    message(rep(".", 20))
    message(rep(".", 20))

    # ***
    # workspace management: (1) remove old workspace (2) create new workspace 
    all_workspaces <- list.dirs(file.path(getwd(), "www", "bam_workspace"), recursive=FALSE)
    workspaces_to_delete <- difftime(Sys.time(), file.mtime(all_workspaces), units="m") > 60 * 24 # number of minutes after which folders should be removed
    # workspaces_to_delete <- difftime(Sys.time(), file.mtime(all_workspaces), units="m") > 1 # number of minutes after which folders should be removed
    delete_success <- unlink(all_workspaces[workspaces_to_delete], recursive=TRUE)
    workspace_id <- randomString(7)
    workspace <- file.path(getwd(), "www", "bam_workspace", workspace_id)
    
    # currently disabled for easier debugging
    # workspace_id <- "HYLPXWD"
    # workspace <- file.path(getwd(), "www", "bam_workspace", sessionid)
    message("WORKSPACE ID: ", workspace_id)
    message("WORKSPACE: ", workspace)
    message(rep("-", 20))

    # ***
    # BaM catalogue: model, distributions (and their parameters)
    catalogue <- RBaM::getCatalogue()
    # let's use a subset of available model
    catalogue$models <- c("TextFile", "BaRatin", "Linear")
    # let's use a subset of available distributions:
    catalogue$distributions <- c("Gaussian", "Uniform", "Triangle", "LogNormal", "Exponential", "FlatPrior", "FlatPrior+", "FlatPrior-", "FIX")
    catalogue$parameters <- sapply(catalogue$distributions, RBaM::getParNames)
    session$sendCustomMessage("shinier_bam_data", catalogue)

    # ===============================================================
    # listener for change in equation input of TextFileEquation JS object
    observeEvent(input$textfile_equation_changed, {
        message(" > textfile_equation_changed")
        eqs <- input$textfile_equation_changed$eq
        variables <- c()
        valid <- rep(FALSE, length(eqs));
        for (k in 1:length(eqs)) {
            if (eqs[k] != "") {
                p <- NULL
                try(p <- all.vars(parse(text=eqs[k])), silent = TRUE);
                if (!is.null(p)) {
                    variables <- c(variables, p)
                    valid[k] <- TRUE
                }
            } 
        }
        variables <- unique(variables)
        session$sendCustomMessage("textfile_equation_changed", list(valid = valid, variables = variables))
    })

    # ===============================================================
    # listener for when Run BaM for calibration is clicked
    # observeEvent(input$run_calibration, eval(run_calibration_expr))
    observeEvent(input$run_calibration, {
        message(" > run_calibration")
        config <- RBaM_configuration(input$run_calibration, workspace)
        if (is.logical(config) && !config) {
            session$sendCustomMessage("bam_data_length_error", runif(1))
        } else {
            message(" > RBaM configuration: Run")
            RBaM::BaM(mod=config$bam$mod, data=config$bam$data, remnant=config$bam$remnant,
            pred=config$bam$pred, doCalib=config$bam$doCalib, doPred=config$bam$doPred,
            workspace=workspace, run=FALSE)
            pid <- RBaM_runExe(workspace, workspace_id)
            # Sys.sleep(60)
            # tools::pskill(pid)
            session$sendCustomMessage("bam_monitoring_calibration", list(i=0)) # start monitoring loop
        }
    })

    # ===============================================================
    # listener for when BaM is running calibration to moniror BaM progress
    # observeEvent(input$bam_mcmc_monitoring_in, eval(bam_mcmc_monitoring_in_expr))
    observeEvent(input$bam_monitoring_calibration, {
        message(" > bam_monitoring_calibration")
        data <- input$bam_monitoring_calibration
        data$i <- RBaM_monitorCalibration(workspace);
        print("HAS ERROR???")
        print(RBaM_hasError(workspace))
        if (RBaM_hasError(workspace)) data$i <- -1
        message("  > progress: ", floor(data$i), "% ==> ", data$i);
        print(data)
        session$sendCustomMessage("bam_monitoring_calibration", data)
    })

    # ===============================================================
    # listener for when BaM is running calibration to moniror BaM progress
    # observeEvent(input$bam_mcmc_monitoring_in, eval(bam_mcmc_monitoring_in_expr))
    observeEvent(input$bam_calibration_results, {
        message(" > bam_calibration_results")
        results <- RBaM_getCalibrationResults(workspace);
        results$failure <- RBaM_hasError(workspace)
        session$sendCustomMessage("bam_calibration_results", results)
    })

    # ===============================================================
    # listener for when Run BaM for prediction is clicked
    observeEvent(input$run_prediction, {
        message(" > run_prediction")
        config <- RBaM_configuration(input$run_prediction, workspace)
        if (is.logical(config) && !config) {
            session$sendCustomMessage("bam_data_length_error", runif(1))
        } else {
            RBaM::BaM(mod=config$bam$mod, data=config$bam$data, remnant=config$bam$remnant,
            pred=config$bam$pred, doCalib=config$bam$doCalib, doPred=config$bam$doPred,
            workspace=workspace, run=FALSE)
            session$sendCustomMessage("bam_monitoring_prediction", list(i=0, config=config$monitoring$pred))
            RBaM_runExe(workspace)
        }
    })

    # ===============================================================
    # listener for when BaM is running prediction to moniror BaM progress
    observeEvent(input$bam_monitoring_prediction, {
        message(" > bam_monitoring_prediction")
        data <- input$bam_monitoring_prediction
        data$i <- RBaM_monitorPrediction(workspace, data$config$name);
        session$sendCustomMessage("bam_monitoring_prediction", data)
    })
    observeEvent(input$bam_prediction_results, {
        message(" > bam_prediction_results")
        data <- input$bam_prediction_results
        # attempt to get the results
        results <- RBaM_getPredictionResults(workspace, data$config);
        # success is determined if none of the results/input files list is of length 0
        success = !any(unlist(lapply(results, length))==0)
        if (!success) results = FALSE
        session$sendCustomMessage(paste0("prediction_results: ", data$config$name), list(config=data$config, results=results))
    })
    # for developing the Result component
    # observeEvent(input$ask_for_current_bam_results, eval(ask_for_current_bam_results_expr))

}

# runApp("C:/Users/ivan.horner/Documents/Forges/BaM/trunk/R/shinieRBaM/", launch.browser = TRUE, port=floor(runif(1, 999, 10000)))
# runApp("C:/Users/ivan.horner/Documents/Forges/BaM/trunk/R/shinieRBaM/", launch.browser = TRUE, port=5003)
# runApp(getwd(), launch.browser = TRUE, port=5003)

# options()
#  "C:\Program Files\Google\Chrome\Application\chrome.exe --kiosk http:\\127.0.0.1:5481"
# options(browser = "C:/Program Files (x86)/Mozilla Firefox/firefox.exe")

# install.packages("C:/Users/ivan.horner/Documents/Forges/BaM/trunk/R/RBaM_Compiled/Windows_R_4.0.2/RBaM_0.1.0.tar.gz", repos=NULL) # nolint
# shiny::runApp(getwd(), launch.browser = FALSE)
NULL
shinyApp(htmlTemplate(file.path("www",'index.html')), server, options=list(launch.browser = TRUE, port=5003))


# bug list: 
# > autoscroll when switching to max-size mode to list mode with predictions