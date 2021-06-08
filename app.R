library(RBaM)
source(file.path(getwd(), "server", "RBaM_BaMit.R"))

server <- function(input, output, session) {
    # ===============================================================
    # Initialize session
    message(rep(".", 20))

    # ***
    # workspace management: (1) remove old workspace (2) create new workspace 
    all_workspaces <- list.dirs(file.path(getwd(), "www", "bam_workspace"), recursive=FALSE)
    workspaces_to_delete <- difftime(Sys.time(), file.mtime(all_workspaces), units="m") > 60 * 24 # number of minutes after which folders should be removed
    delete_success <- unlink(all_workspaces[workspaces_to_delete], recursive=TRUE)
    workspace <- file.path(getwd(), "www", "bam_workspace", randomString(7))
    
    # currently disabled for easier debugging
    # sessionid <- "HYLPXWD"
    # workspace <- file.path(getwd(), "www", "bam_workspace", sessionid)

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
        message(" > RBaM configuration: Run")
        RBaM::BaM(mod=config$bam$mod, data=config$bam$data, remnant=config$bam$remnant,
        pred=config$bam$pred, doCalib=config$bam$doCalib, doPred=config$bam$doPred,
        # workspace=workspace)
        workspace=workspace, consoleOutputFilepath=file.path(workspace, "stdout.log"))
        # RBaM_runExe(workspace)
        print(config$monitoring)
        print(config$monitoring$mcmc)
        session$sendCustomMessage("bam_monitoring_calibration", list(i=0, x=config$monitoring$mcmc))
    })

    # ===============================================================
    # listener for when BaM is running calibration to moniror BaM progress
    # observeEvent(input$bam_mcmc_monitoring_in, eval(bam_mcmc_monitoring_in_expr))
    observeEvent(input$bam_monitoring_calibration, {
        x <- input$bam_monitoring_calibration$x
        i <- RBaM_monitorCalibration(workspace, x);
        message("  > progress: ", floor(i), "% ==> ", i);
        session$sendCustomMessage("bam_monitoring_calibration", list(i=i, x=x))
        if (i==100L) {
            # FIXME: manage BaM error
            results <- RBaM_getCalibrationResults(workspace);
            session$sendCustomMessage("calibration_results", results)
        }
    })

    # ===============================================================
    # listener for when Run BaM for prediction is clicked
    observeEvent(input$run_prediction, {
        print(str(input$run_prediction))
        # session$sendCustomMessage("bam_monitoring_prediction", list(i=0))
        # monitoring_prediction <- RBaM_configuration(input$run_prediction, workspace)$prediction
        # # session$sendCustomMessage("bam_monitoring_prediction", list(i=0, config=monitoring_prediction))
        # RBaM_runExe(workspace)
    })

    # ===============================================================
    # listener for when BaM is running prediction to moniror BaM progress
    observeEvent(input$bam_monitoring_prediction, {
        i <- RBaM_monitorPrediction(workspace);
        session$sendCustomMessage("bam_monitoring_prediction", list(i=i))
        if (i==100L) {
            # results <- RBaM_getPredictionResults(workspace);
            # session$sendCustomMessage("prediction_results", results)
        }

        # message("  > progress: ", floor(i), "% ==> ", i);
        # session$sendCustomMessage("bam_monitoring_prediction", list(i=i, config=input$bam_monitoring_prediction$config))
        # if (i==100L) {
        #     results <- RBaM_getCalibrationResults(workspace);
        #     session$sendCustomMessage("calibration_results", results)
        # }
    })


    # for developing the Result component
    observeEvent(input$ask_for_current_bam_results, eval(ask_for_current_bam_results_expr))

}

# runApp("C:/Users/ivan.horner/Documents/Forges/BaM/trunk/R/shinieRBaM/", launch.browser = TRUE, port=floor(runif(1, 999, 10000)))
# runApp("C:/Users/ivan.horner/Documents/Forges/BaM/trunk/R/shinieRBaM/", launch.browser = TRUE, port=5003)
# runApp(getwd(), launch.browser = TRUE, port=5003)

# options()
#  "C:\Program Files\Google\Chrome\Application\chrome.exe --kiosk http:\\127.0.0.1:5481"
# options(browser = "C:/Program Files (x86)/Mozilla Firefox/firefox.exe")

# install.packages("C:/Users/ivan.horner/Documents/Forges/BaM/trunk/R/RBaM_Compiled/Windows_R_4.0.2/RBaM_0.1.0.tar.gz", repos=NULL)

shinyApp(htmlTemplate(file.path("www",'index.html')), server, options=list(launch.browser = TRUE, port=5003))
