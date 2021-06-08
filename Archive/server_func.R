RBaM_runExe <- function(workspace){
    exedir  <- file.path(path.package("RBaM"), "bin")
    exename <- "BaM"
    saveWD  <- getwd() # remember current working dir
    setwd(exedir) # need to set working dir to the exe dir
    os  <- Sys.info()["sysname"] # determine OS
    cmd <- ifelse(os == "Windows",
                paste0(exename, ".exe"), # Windows command
                paste0("./", exename)    # Linux command
    )
    # call BaM asynchronoustly i.e. on a separate process to free R
    # store console output into a file, also used to detect when BaM is done
    console_file <- file.path(workspace, "bam_console.txt")
    system2(cmd, stdout = console_file, stderr = console_file, wait = FALSE, input = " ") # run exe
    setwd(saveWD) # move back to initial working directory
}

RBaM_getResults <- function(workspace) {
    con <- file(file.path(workspace, "bam_console.txt"))
    log <- tryCatch({
            readLines(con)
        }, error = function(error) {
            print(error)
            list(error$message)
        }, warning = function(warning) {
            print(warning)
            list(warning$message)
        }
    )
    close(con)
    # just to avoid reading results when BaM is still running
    if (length(log) == 1L) return(list(log=log, mcmc=NULL, residuals=NULL, summary=NULL, mcmc_density=NULL)) 
    mcmc <- tryCatch({
        read.table(
            file = file.path(workspace, "Results_Cooking.txt"), 
            header = TRUE,
            na.strings = "-0.999900E+04"
        )}, error = function(error) {
            print(error)
            NULL
        }, warning = function(warning) {
            print(warning)
            NULL
        }
    )
    mcmc_density <- list()
    if (!is.null(mcmc)) {
        for (k in 1:ncol(mcmc)) {
            mcmc_density[[colnames(mcmc)[k]]] <- density(mcmc[, k])[c("x", "y")]
        }
    }
    residuals <- tryCatch({
        read.table(
            file = file.path(workspace, "Results_Residuals.txt"),
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
    summary <- tryCatch({
        read.table(
            file = file.path(workspace, "Results_Summary.txt"),
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
    summary <- cbind(data.frame(statistics=rownames(summary)), summary)
    return(list(log=log, mcmc=mcmc, residuals=residuals, summary=summary, mcmc_density=mcmc_density))
}


processCalibrationData <- function(data) {
    # I implemented many (useless) checks that can make the server crash if any error is found
    # FIXME: anything that can make the server crash should be handled in tryCatch statement
    # to exit silently without making the server crash...

    rawWithNullReplacedByNAandNoNullUnlisted <- function(rawData) {
        # I need this function because if you can't assign a NULL value to a list: 
        # somelist[[1]] <- NULL does nothing if the element hasn't been initialized beforehand
        if (is.null(rawData)) return(NA)
        return(unlist(rawData))
    }

    X <- list()
    Xu <- list()
    Xb <- list()
    Xi <- list()
    Xnames <- names(data$inputs)
    for (k in seq_along(data$inputs)) {
        X[[k]] <- rawWithNullReplacedByNAandNoNullUnlisted(data$inputs[[k]]$v) # this should never be empty
        Xu[[k]] <- rawWithNullReplacedByNAandNoNullUnlisted(data$inputs[[k]]$u) # this is either NULL or a vector of length n
        Xb[[k]] <- rawWithNullReplacedByNAandNoNullUnlisted(data$inputs[[k]]$b) # this is either NULL or a vector of length n
        Xi[[k]] <- rawWithNullReplacedByNAandNoNullUnlisted(data$inputs[[k]]$bindex) # this is either NULL or a vector of length n + b/bindex must be both specified or not specified

        n <- length(X[[k]])
        if (n <= 0) stop(paste("Input variable", Xnames[k], " empty!"))
        if (!is.na(Xu[[k]]) && length(Xu[[k]]) != n) stop(paste("Input variable", Xnames[k], " : uncertainty 'u' with invalid length!"))
        if (!is.na(Xb[[k]]) && length(Xb[[k]]) != n) stop(paste("Input variable", Xnames[k], " : uncertainty 'b' with invalid length!"))
        if (!is.na(Xi[[k]]) && length(Xi[[k]]) != n) stop(paste("Input variable", Xnames[k], " : uncertainty 'bindex' with invalid length!"))
        if ((!is.na(Xb[[k]]) && is.na(Xi[[k]])) || (is.na(Xb[[k]]) && !is.na(Xi[[k]]))) stop(paste("Input variable", Xnames[k], " : 'b' / 'bindex' invalid!"))
    }

    Y <- list()
    Yu <- list()
    Yb <- list()
    Yi <- list()
    Ynames <- names(data$outputs)
    for (k in seq_along(data$outputs)) {
        Y[[k]] <- rawWithNullReplacedByNAandNoNullUnlisted(data$outputs[[k]]$v) # this should never be empty
        Yu[[k]] <- rawWithNullReplacedByNAandNoNullUnlisted(data$outputs[[k]]$u) # this is either NULL or a vector of length n
        Yb[[k]] <- rawWithNullReplacedByNAandNoNullUnlisted(data$outputs[[k]]$b) # this is either NULL or a vector of length n
        Yi[[k]] <- rawWithNullReplacedByNAandNoNullUnlisted(data$outputs[[k]]$bindex) # this is either NULL or a vector of length n + b/bindex must be both specified or not specified

        n <- length(Y[[k]])
        if (n <= 0) stop(paste("Output variable", Ynames[k], " empty!"))
        if (!is.na(Yu[[k]]) && length(Yu[[k]]) != n) stop(paste("Output variable", Ynames[k], " : uncertainty 'u' with invalid length!"))
        if (!is.na(Yb[[k]]) && length(Yb[[k]]) != n) stop(paste("Output variable", Ynames[k], " : uncertainty 'b' with invalid length!"))
        if (!is.na(Yi[[k]]) && length(Yi[[k]]) != n) stop(paste("Output variable", Ynames[k], " : uncertainty 'bindex' with invalid length!"))
        if ((!is.na(Yb[[k]]) && is.na(Yi[[k]])) || (is.na(Yb[[k]]) && !is.na(Yi[[k]]))) stop(paste("Output variable", Ynames[k], " : 'b' / 'bindex' invalid!"))
    }



    listToDataFrameWithZeroFillingIfNeeded <- function(dataList) {
        isEmpty <- is.na(dataList) # is.na/anyNA cannot be used
        if (all(isEmpty)) {
            return(NULL)
        } else {
            dataLength <- unique(vapply(dataList, length, numeric(1L))[!isEmpty])
            if (length(dataLength) != 1L) {
                warning("debugging: this should never happend")
                return(NULL)
            }
            if (any(isEmpty)) {
                dataList[isEmpty] <- rep(list(rep(0, dataLength)), sum(isEmpty))
            }
            return(as.data.frame(dataList));
        }
    }

    X <- listToDataFrameWithZeroFillingIfNeeded(X)
    Y <- listToDataFrameWithZeroFillingIfNeeded(Y)
    Xu <- listToDataFrameWithZeroFillingIfNeeded(Xu)
    Yu <- listToDataFrameWithZeroFillingIfNeeded(Yu)
    Xb <- listToDataFrameWithZeroFillingIfNeeded(Xb)
    Yb <- listToDataFrameWithZeroFillingIfNeeded(Yb)
    Xi <- listToDataFrameWithZeroFillingIfNeeded(Xi)
    Yi <- listToDataFrameWithZeroFillingIfNeeded(Yi)

    return(
        list(
            X = X, Y = Y,
            Xu = Xu, Yu = Yu,
            Xb = Xb, Yb = Yb,
            Xbindex = Xi, Ybindex = Yi
            )
        )
}
