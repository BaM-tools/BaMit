RBaM_configuration <- function(config, workspace) {
    message(" > ************************************* ")
    message(" > RBaM configuration: ", ifelse(config$project$doCalib, "calibration", "prediction"))
    if(!dir.exists(workspace)){
        message(paste0(" > RBaM configuration: creating wording directory '", workspace, "'"))
        dir.create(workspace, recursive = TRUE)
    }

    message(" > RBaM configuration: xtraModelInfo")
    str(config$xtra$xtra)
    config$xtra$xtra$inputs <- unlist(config$xtra$xtra$inputs)     # this is model specific
    config$xtra$xtra$formulas <- unlist(config$xtra$xtra$formulas) # this is model specific
    str(config$xtra$xtra)
    xtra <- RBaM::xtraModelInfo(object=config$xtra$xtra)

    message(" > RBaM configuration: parameter")
    priors <- lapply(config$parameters, function(e) {
        RBaM::parameter(
            name = e$name,
            init = e$initial,
            prior.dist = e$dist_name,
            prior.par = unlist(e$dist_parameters)
        )
    })

    message(" > RBaM configuration: calibration dataset")
    processData <- function(V) {
        V <- lapply(V, function(v) {
            unlist(sapply(v, function(e) ifelse(is.null(e), NA, e)))
        })
        n <- max(unique(vapply(V, length, numeric(1L))))
        if (n == 0L) return(NULL)
        V <- lapply(V, function(v) {
            if (length(v) == 0L) {
                return(rep(0, n))
            } else if (length(v) == n) {
                return(v);
            } else {
                warning("Number of rows don't match!")
                return(rep(0, n))
            }
        })
        as.data.frame(V)
    }
    config$calibration_data$inputs <- lapply(config$calibration_data$inputs, processData)
    config$calibration_data$outputs <- lapply(config$calibration_data$outputs, processData)
    calibration_data <- RBaM::dataset(
        X = config$calibration_data$inputs$v,
        Y = config$calibration_data$outputs$v,
        data.dir = workspace,
        Xu = config$calibration_data$inputs$u,
        Yu = config$calibration_data$outputs$u,
        Xb = config$calibration_data$inputs$b,
        Yb = config$calibration_data$outputs$b,
        Xb.indx = config$calibration_data$inputs$bindex,
        Yb.indx = config$calibration_data$outputs$bindex
    )
    print(str(calibration_data))

    message(" > RBaM configuration: remnantErrorModel")
    remnant_errors <- lapply(config$remnant_errors, function(O) {
        P <- lapply(O$parameters, function(P) {
            RBaM::parameter(
                name = P$name,
                init = P$initial,
                prior.dist = P$dist_name,
                prior.par = unlist(P$dist_parameters)
            )
        })
        RBaM::remnantErrorModel(funk=O$model, par=P)
    })
    print(str(remnant_errors))

    message(" > RBaM configuration: model")
    nX  <- ncol(config$calibration_data$inputs$v);
    nY  <- ncol(config$calibration_data$outputs$v);
    mod <- model(ID=config$xtra$id, nX=config$xtra$nX, nY=config$xtra$nY,
                 par=priors, xtra=xtra)
    print(str(mod))

    if(config$project$doPred) {
        message(" > RBaM configuration: prediction")
        config$prediction$inputs <- lapply(config$prediction$inputs, processData)
        outputName <- colnames(config$calibration_data$outputs$v)
        if (config$prediction$pred_type == "total") {
            pred_type <- list(doParametric=TRUE, doStructural=rep(TRUE, nY), priorNsim=NULL)
        } else if (config$prediction$pred_type == "param") {
            pred_type <- list(doParametric=TRUE, doStructural=rep(FALSE, nY), priorNsim=NULL)
        } else if (config$prediction$pred_type == "maxpost") {
            pred_type <- list(doParametric=FALSE, doStructural=rep(FALSE, nY), priorNsim=NULL)
        } else if (config$prediction$pred_type == "prior") {
            pred_type <- list(doParametric=FALSE, doStructural=rep(FALSE, nY), priorNsim=500)
        }

        X <- processData(config$prediction$inputs)
        predFile <- paste0("Pred_", config$prediction$name, "_config.txt")
        inputFiles <- paste0('pred_', config$prediction$name,'_input_', 1:length(X), '.txt')
        # spagFiles <- paste0('pred_', config$prediction$name,'_output_', outputName,  "_spagh")
        # envFiles  <- paste0('pred_', config$prediction$name,'_output_', outputName,  "_env")
        spagFiles <- paste0(config$prediction$name,'_', outputName,  "_spagh")
        envFiles  <- paste0(config$prediction$name,'_', outputName,  "_env")
        pred <- RBaM::prediction(X=X, 
                                 data.dir=workspace,
                                 data.fnames=inputFiles, fname=predFile,
                                 spagFiles=spagFiles, envFiles=envFiles,  
                                 doParametric=pred_type$doParametric,
                                 doStructural=pred_type$doStructural,
                                 priorNsim=pred_type$priorNsim,
                                 transposeSpag=TRUE);
        MCMC <- processData(config$mcmc)
        RBaM_writeMCMC(MCMC, workspace);
        print(str(pred))
    } else {
        pred <- NULL
    }

    message(" > RBaM configuration: monitoring")
    # 10000 below stands for the number of MCMC samples
    mon_mcmc <- (1 + length(config$parameters) + sum(vapply(config$remnant_errors, function(O) return(length(O$parameters)), numeric(1L)))) * 10000
    # pred config for monitoring and result files retrieval
    mon_pred <- list(n=0, spaghFiles=c(), envFiles=c(), inputFiles=c(), name="")
    if (config$project$doPred) {
        mon_pred <- list(n = nrow(X) * nrow(MCMC), spagFiles=spagFiles, envFiles=envFiles, inputFiles=inputFiles, name=config$prediction$name)
    }
    monitoring_config <- list(mcmc = mon_mcmc, pred = mon_pred)
    print(str(monitoring_config))

    message(" > RBaM configuration: configugation object")
    configuration <- list(
        mod=mod, 
        data=calibration_data,
        remnant=remnant_errors,
        pred=pred,
        doCalib=config$project$doCalib,
        doPred=config$project$doPred,
        workspace=workspace
    )
    return(list(bam=configuration, monitoring=monitoring_config))
}

RBaM_runExe <- function(workspace){
    exedir  <- file.path(path.package("RBaM"), "bin")
    exename <- "BaM"
    saveWD  <- getwd() # remember current working dir
    message(getwd())
    setwd(exedir) # need to set working dir to the exe dir
    message(getwd())
    os  <- Sys.info()["sysname"] # determine OS
    cmd <- ifelse(os == "Windows",
                paste0(exename, ".exe"), # Windows command
                paste0("echo 'trying...'; ./", exename)    # Linux command
                # paste0("echo Irstea69 | sudo -S ./", exename)    # Linux command   echo mypassword | sudo -S command
    )
    message(cmd)
    # call BaM asynchronoustly i.e. on a separate process to free R
    # store console output into a file
    # this is also used to detect when BaM calibration is done
    # console_file <- file.path(workspace, "bam_console.txt")
    console_file <- file.path(workspace, "stdout.log")
    # run exe (note: input=" " is necessary to close the process it finishes)
    system2(cmd, stdout = console_file, stderr = console_file, wait = FALSE, input = " ") 
    message(getwd())
    setwd(saveWD) # move back to initial working directory
    message(getwd())
}

RBaM_readResultFile <- function(workspace, filename, header=TRUE) {
    tryCatch({
        read.table(
            file = file.path(workspace, filename),
            header=header,
            na.strings = "-0.999900E+04"
        )}, error = function(error) {
            print(error)
            NULL
        }, warning = function(warning) {
            print(warning)
            NULL
        }
    )
}


RBaM_getCalibrationResults <- function(workspace) {
    mcmc <- RBaM_readResultFile(workspace, "Results_Cooking.txt");
    resi <- RBaM_readResultFile(workspace, "Results_Residuals.txt");
    summ <- RBaM_readResultFile(workspace, "Results_Summary.txt");
    print(summ)
    summ <- cbind(" "=rownames(summ), summ)
    print(summ)
    log  <- RBaM_getLogFile(workspace)
    mcmc_density <- list();
    if (!is.null(mcmc)) {
        for (k in 1:ncol(mcmc)) {
            mcmc_density[[colnames(mcmc)[k]]] <- density(mcmc[, k])[c("x", "y")]
        }
    }
    return(list(log=log, mcmc=mcmc, residuals=resi, summary=summ, mcmc_density=mcmc_density))
}

RBaM_getPredictionResults <- function(workspace, config) {

    inputs <- list()
    for (f in config$inputFiles) {
        inputs[[strsplit(f, ".", fixed=TRUE)[[1]][1]]] <- RBaM_readResultFile(workspace, f, FALSE)
    }

    outputs_env <- list()
    for (f in config$envFiles) {
        outputs_env[[f]] <- RBaM_readResultFile(workspace, f, TRUE)
    }
    outputs_spag<- list()
    for (f in config$spagFiles) {
        outputs_spag[[f]] <- RBaM_readResultFile(workspace,f, FALSE)
    }
    return(list(inputs=inputs, outputs_env=outputs_env, outputs_spag=outputs_spag))
}

RBaM_getLogFile <- function(workspace) {
    con <- file(file.path(workspace, "stdout.log"))
    log <- tryCatch({
            readLines(con)
        }, error = function(error) {
            list()
        }, warning = function(warning) {
            list()
        }
    )
    close(con)
    return(log)
}
RBaM_writeMCMC <- function(data, workspace) {
    write.table(x=data, file=file.path(workspace, "Results_Cooking.txt"),
               quote=FALSE, sep = " ", na = "-9999", row.names = FALSE, col.names = TRUE);
}


# fp <- file.path(getwd(), "www/bam_workspace", "XETGJUX", "stdout.log")
# fp <- file.path(getwd(), "www/bam_workspace", "WLUCOZL", "stdout.log")
# log <- readLines(fp)
# sapply(log, function(x) {return(grep("files", x, fixed=TRUE))})
# grep("ERROR", log, fixed=TRUE)

# grep("files", log[11], fixed=TRUE, value=TRUE)
#  charmatch("f", log[11])
RBaM_hasError <- function(workspace) {
    f <- tryCatch({
        readLines(file.path(workspace, "stdout.log"))
    }, error = function(error) {
        ""
    })
    print(f)
    e <- grep("ERROR", f, fixed=TRUE)
    return(length(e) > 0)
}

RBaM_monitorCalibration <- function(workspace) {
    progress <- tryCatch({
        p <- readLines(file.path(workspace, "Config_MCMC.txt.monitor"))
        ifelse(length(p)>0L, p, "0/100")
    }, error = function(error) {
        "0/100"
    })
    progress <- strsplit(progress, "/")[[1]]
    progress <- sapply(progress, as.numeric)
    i <- unname(progress[1] / progress[2] * 100)[1]
    return(i);
}

RBaM_monitorPrediction <- function(workspace, name) {
    progress <- tryCatch({
        p <- readLines(file.path(workspace, paste0("Pred_", name, "_config.txt.monitor")))
        ifelse(length(p)>0L, p, "0/100")
    }, error = function(error) {
        "0/100"
    })
    progress <- strsplit(progress, "/")[[1]]
    progress <- sapply(progress, as.numeric)
    i <- unname(progress[1] / progress[2] * 100)[1]
    if (progress[1] == progress[2] + 1) return(101)
    return(i);
}

randomString <- function(n=10) {
    possible_characters <- LETTERS #c(letters, LETTERS, 0:9)
    paste(sample(possible_characters, n, TRUE), collapse="")
}
