RBaM_configuration <- function(config, workspace) {
    message(" > ************************************* ")
    message(" > RBaM configuration: ", ifelse(config$project$doCalib, "calibration", "prediction"))
    message(" > RBaM configuration: workspace cleanup")
    sapply(list.files(workspace), function(fn) file.remove(file.path(workspace, fn)))

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

    message(" > RBaM configuration: model")
    nX  <- ncol(config$calibration_data$inputs$v);
    nY  <- ncol(config$calibration_data$outputs$v);
    mod <- model(ID=config$xtra$id, nX=config$xtra$nX, nY=config$xtra$nY,
                 par=priors, xtra=xtra)

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
        spagFiles <- paste0(outputName, "_", config$prediction$name, ".spagh")
        envFiles  <- paste0(outputName, "_", config$prediction$name, ".env")
        X <- processData(config$prediction$inputs)
        pred <- RBaM::prediction(X=X, 
                                 spagFiles=spagFiles, envFiles=envFiles, data.dir=workspace, 
                                 doParametric=pred_type$doParametric,
                                 doStructural=pred_type$doStructural,
                                 priorNsim=pred_type$priorNsim,
                                 transposeSpag=TRUE);
        MCMC <- processData(config$mcmc)
        RBaM_writeMCMC(MCMC, workspace);
    } else {
        pred <- NULL
    }

    message(" > RBaM configuration: monitoring")
    # 10000 below stands for the number of MCMC samples
    mon_mcmc <- (1 + length(config$parameters) + sum(vapply(config$remnant_errors, function(O) return(length(O$parameters)), numeric(1L)))) * 10000
    # pred config is still under development
    mon_pred <-  ifelse(config$project$doPred,
        list(n = nrow(X) * nrow(MCMC), spagFiles=spagFiles, envFiles=envFiles),
        list(n=0, spaghFiles=c(), envFiles=c()))
    monitoring_config <- list(mcmc = mon_mcmc, pred = mon_pred)
    
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

RBaM_readResultFile <- function(workspace, filename) {
    tryCatch({
        read.table(
            file = file.path(workspace, filename),
            header=TRUE,
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
    log  <- RBaM_getLogFile(workspace)
    mcmc_density <- list();
    if (!is.null(mcmc)) {
        for (k in 1:ncol(mcmc)) {
            mcmc_density[[colnames(mcmc)[k]]] <- density(mcmc[, k])[c("x", "y")]
        }
    }
    return(list(log=log, mcmc=mcmc, residuals=resi, summary=summ, mcmc_density=mcmc_density))
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

RBaM_monitorCalibration <- function(workspace, config) {
    log <- RBaM_getLogFile(workspace)
    if (length(log)==0L) {
        n_th <- 14.003 * config + 20004; # empirical estimation of file size when complete
        n_ac <- tryCatch(file.size(file.path(workspace, "Results_MCMC.txt")),
                         error=function(e) 1, warning=function(w) 1)
        i <- n_ac / n_th * 100
        i <- ifelse(is.na(i), 1, i)
        i <- ifelse(i>100, 99.99, i)
    } else {
        i <- 100; 
    }
    # i <- 100; # DEBUG: override everything
    return(i);
}

RBaM_monitorPrediction <- function(workspace, config) {
    log <- RBaM_getLogFile(workspace)
    if (length(log)==0L) {
        i <- 1
    } else {
        i <- 100
    }
    return(i)
}
# RBaM_monitorPrediction <- function(workspace, config) {
#     log <- RBaM_getLogFile(workspace)
#     fs_spag <- file.size(file.path(workspace, config$config$spagFiles))
#     fs_env  <- file.size(file.path(workspace, config$config$envFiles))
#     fs_spag <- sum(sapply(fs_spag, function(e) if (is.na(e)) return(0) else return(e)))
#     fs_env  <- sum(sapply(fs_env , function(e) if(is.na(e)) return(0) else return(e)))
#     if (length(log)==0L) {
#         # n_th    <- 15.218 * config$x + 107; # empirical estimation of file size when complete
#         n_th    <- 17.144 * config$config$n + 1070; # empirical estimation of file size when complete
#         n_ac    <- fs_spag + fs_env;
#         i       <- n_ac / n_th * 100
#         if (i > 100) i <- 99.99 # should not happen... but just in case
#         if (i < config$i) i <- config$i
#         # print(i);        
#         i <- runif(1, 0, 100);
#         message("-----")
#         print(config$config$n)
#         # print(i)
#         print(fs_spag)
#         print(fs_env)
#     } else {
#         message("+++++")
#         print(config$config$n)
#         print(fs_spag)
#         print(fs_env)
#         i <- 100; 
#     }
#     return(i);
# }

randomString <- function(n=10) {
    possible_characters <- LETTERS #c(letters, LETTERS, 0:9)
    paste(sample(possible_characters, n, TRUE), collapse="")
}
