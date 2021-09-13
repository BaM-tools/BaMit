0. Connect to server ssh bam@buvard.lyon.irstea.priv
1. Send folders into server and recompile BaM
2. Copy BaM into RBaM package directory
   sudo cp /home/bam/BaM_compilation/BaM/makefile/BaM /usr/local/lib/R/site-library/RBaM/bin/BaM
3. Send BaMit to /srv/shiny-server/bam: app.R, /server and /www
4. Send BaMit to /srv/shiny-server/bam: app.R, /server and /www. Create folder /www/bam_workspace if not there.
5. Change access rights of www/bam_workspace (sudo chmod a=rwx bam_workspace)
6. Change access rights of the folder where BaM executable is (including execution of BaM executable)

