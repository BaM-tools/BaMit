#*******************************************************************************
#' This script contains evaluated by the shiny server function
#' for various observedEvent, identified by @in below which is the reactive value
#' containing data from the client that has changed and should trigger an 
#' event server side.
#' Events that are triggered are processed in these expressions. In most
#' cases, these events end with a respond to the client where data is sent
#' under a specific ID, identified by @out below.
#*******************************************************************************

#*******************************************************************************
#' expression called when user changes one of the equations in a TextFileModel
#' bamComponent to detect variables/parameters contained within.
#' 
#' @in: input$textfile_equation_changed
#' It is a list with two components:
#' > ID: character, is used to identify the client when sending back 
#'   the results. 
#' > eq: character vector, contains the equations
#' 
#' @out: paste0("textfile_equation_changed_", ID)
#' a list with two components is returned to the client:
#' > valid: logical, whether the equation is valid
#' > variables: character vector, vector containing the names of the 
#'   parameters/variables detected in all the equation. Duplicates are ignored.
#' 
textfile_equation_changed_expr <- expression({
    message(" > textfile_equation_changed")
    ID <- input$textfile_equation_changed$ID
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
    session$sendCustomMessage(
        paste0("textfile_equation_changed_", ID),
        list(valid = valid, variables = variables)
    )
})

#*******************************************************************************
#' expression called when user clicks "Run BaM".
#' From the configuration of BaM specified by the user, RBaM package is used to 
#' configure and launch BaM. It calls RBaM::BaM(..., run=FALSE) and a custom
# ' BaM launch function RBaM_runExe() which is used to run BaM 
#' asynchronously (another process) so it doesn't freeze the server.
#' A list containing data used for monitoring BaM.exe progress is sent back to
#' the client to initialize BaM.exe progress monitoring.
#' 
#' @in: input$run_calibration
#' It is a list with several components containing details used to configure
#' RBaM:
#' > modelid: character, ID of BaM model (e.g. "TextFile")
#' > xtra: list, can directly be used by RBaM::xtraModelInfo()
#' > priors: list, each element is a list with all the information needed to 
#'   create RBaM parameter (name, initial, dist_name, dist_parameters)
#' > inputs: list, see bamProcessData() function for details
#' > outputs: list, see bamProcessData() function for details
#' > remnant: list, each element correspond to one of the BaM model output
#'   and is a list with a 'model' element (character vector with the name of the
#'   remnant error model) and 'parameters' element (list, same as for 'priors')
#' 
#' @out: bam_mcmc_monitoring_out
#' a list: 
#' > i=0: integer, current iteration used to monitor BaM.exe progress
#' > n=10000: integer, maximum number of iterations (i==n ==> BaM.exe is done)
#' > i_size=0: float, number of bits for one iteration used to estimated BaM.exe
#'   progress from the size of Result_MCMC.txt result file. It is an estimation,
#'   updated from time to time.
#' > c_size=0: float, current size of Result_MCMC.txt.
#' > estim_countdown=0, integer, counter used to re-estimate 'i_size' from time
#'   to time (e.g. every 10 times server is queried to have the current progress).
#' > done=FALSE: logical, is BaM.exe done?
#' > results=FALSE: list containing the results of BaM.exe i.e. console
#'   outputs and the content of the result files (see details below, detailed for
#'   expression 'bam_mcmc_monitoring_in_expr').
#' > ws=workspace, character, file path to the session's current BaM working directory
#'   (see session initialization for more details)
#' > id=sessionid, character, session id
run_calibration_expr <- expression({
    message(" > run")

    message("BaM run: configuring BaM...")
    sapply(list.files(workspace), function(fn) file.remove(file.path(workspace, fn)))

    xtra <- RBaM::xtraModelInfo(object=input$run_calibration$xtra)
    priors <- lapply(input$run_calibration$priors, function(e) {
        RBaM::parameter(
            name = e$name,
            init = e$initial,
            prior.dist = e$dist_name,
            prior.par = unlist(e$dist_parameters)
        )
    })

    processedData <- processCalibrationData(input$run_calibration$data)
    data <- RBaM::dataset(
        X = processedData$X,
        Y = processedData$Y,
        data.dir = workspace,
        Xu = processedData$Xu,
        Yu = processedData$Yu,
        Xb = processedData$Xb,
        Yb = processedData$Yb,
        Xb.indx = processedData$Xbindex,
        Yb.indx = processedData$Ybindex
    )

    remnant <- list()
    for (i in seq_len(length(input$run_calibration$remnant))) {
        r <- input$run_calibration$remnant[[i]]
        p <- list()
        for (j in seq_len(length(r$parameters))) {
            p[[j]] <- RBaM::parameter(
                name = r$parameters[[j]]$name,
                init = r$parameters[[j]]$initial,
                prior.dist = r$parameters[[j]]$dist_name,
                prior.par = unlist(r$parameters[[j]]$dist_parameters)
            )
        }
        remnant[[i]] <-  RBaM::remnantErrorModel(funk=r$model, par=p)
    }

    mod <- RBaM::model(
        ID = input$run_calibration$modelid,
        nX = ncol(processedData$X),
        nY = ncol(processedData$Y),
        par = priors,
        xtra = xtra
    )

    RBaM::BaM(
        mod = mod,
        data = data,
        remnant = remnant,
        workspace = workspace,
        run = FALSE
    )

    message("BaM run: launching BaM...");
    RBaM_runExe(workspace)

    message("BaM run: starting progress monitoring...");
    session$sendCustomMessage(
        "bam_mcmc_monitoring_out",
        list(
            i = 0, n = 10000,   # progress: i/n
            i_size=0, c_size=0, # to infer progress from file size: i_size is an estimate of file size change per iteration
            estim_countdown=0,  # a count down used re-estimate i_size every 10 progress query,
            done = FALSE,       # is done?, BaM console output (when done)
            results = list(),   # BaM.exe results when available.
            ws = workspace,     # workspace: a different workspace for each session (client)
            id = sessionid      # sessionid: a unique session id
        )
    )

})

#*******************************************************************************
#' expression called to monitor the progress of BaM.exe during calibration
#' Whenever the client ask to know the progress this expression is called. This 
#' is done automatically by the client. This expression sends back a respons to
#' the client with the current progress. Client keeps asking until BaM.exe is 
#' done or has crashed.
#' 
#' @in: input$bam_mcmc_monitoring_in
#' A list, see details above for run_expr@out
#' 
#' @out: bam_mcmc_monitoring_out
#' A updated list, see details above for run_expr@out
#' When BaM.exe is done or has crashed, the result component of the list contains:
#' > log: character vector, the console output of BaM.exe (each line is one element of the vector)
#' > mcmc: list, each element is a column of Results_Cooking.txt
#' > residuals: list, each element is a column of Results_Residuals.txt
#' 
bam_mcmc_monitoring_in_expr <- expression({
    message(" > bam_mcmc_monitoring_in")

    # function to count the lines in Results_MCMC.txt,
    # file used to monitor BaM.exe progress
    countLineInMCMCfile <- function(fp) {
        con <- file(fp)
        n   <- length(readLines(con)) - 2
        close(con)
        return(n);
    }

    d <- input$bam_mcmc_monitoring_in # d contains progress information
    possible_error <- FALSE # whether there is a possible error (check if BaM.exe has crashed)
    f <- file.path(d$ws, "Results_MCMC.txt") # file use to monitor progress

    # *********************************
    # IF the file size change per iteration must be estimated
    if (d$estim_countdown == 0) {
        if (file.exists(f)) {
            i <- countLineInMCMCfile(f) # count the lines
            if (i > 0) {
                d$c_size <- file.size(f)
                d$i_size <- d$c_size / i;
                d$i <- i;
                d$estim_countdown <- 10 # verify file size change per iteration every 10 queries
            } else {
                # if Results_MCMC.txt is empty, there's a possible error
                possible_error <- TRUE
            }
        } else {
            # if Results_MCMC.txt doesn't exist there's a possible error
            possible_error <- TRUE
        }
    # *********************************
    # IF the file size change per iteration does not have to be estimated
    } else {
        d$estim_countdown <- d$estim_countdown - 1
        c_size <- file.size(f) # check current file size
        i <- c_size / d$i_size # estimate the progress

        # if size of file hasn't changed, or estimated progress says it's done
        # check if MCMC simulations are actually done
        if (c_size == d$c_size || i >= d$n) {
            # if file size hasn't change of estimated progress is too high, there's a possible error
            possible_error <- TRUE 
            i <- countLineInMCMCfile(f) # count the lines
            d$i <- i
            if (i == d$n) {
                d$done=TRUE
            } else {
                d$c_size <- file.size(f)
                d$i_size <- d$c_size / i;
                d$estim_countdown <- 10
            }
        # otherwise, keep the estimated progress
        } else {
            d$i <- i
        }
        d$c_size <- c_size;
    }
    # if there is a possible error, or if BaM.exe is done
    # read result files and console output (if possible)
    if (possible_error || d$done) {
        d$results <- RBaM_getResults(workspace)
        # if console output exists and has more than one line, BaM.exe has crashed.
        # if there's only one line, it is just R error message saying it hasn't been 
        # able to read the bam_console.txt file because the permission was denied which
        # means BaM.exe is still running.
        if (!is.null(d$results$log) && length(d$results$log) > 1) {
            d$done = TRUE # BaM.exe has crashed
        }
    }
    # send back progress information
    session$sendCustomMessage("bam_mcmc_monitoring_out", d)
})

# For debugging purposes only
ask_for_current_bam_results_expr <- expression({
    # mcmc      <- readMCMC(file=file.path(workspace, 'Results_Cooking.txt'))
    # res       <- read.table(file=file.path(workspace, 'Results_Residuals.txt'), header=TRUE)
    results <- RBaM_getResults(workspace)
    # session$sendCustomMessage("retrieve_current_bam_results", list(mcmc = mcmc, residuals = res))
    session$sendCustomMessage("retrieve_current_bam_results", results)
})