---
title: SLURM Compute Node Configuration
---

The SUPReMM summarization package includes example SLURM prolog and epilog scripts.  The package itself does not need to be installed on the compute nodes, however you may wish to install it on a test node in order to obtain the example scripts.

Package installation instructions are documented on the [SUPReMM summarization package](supremm-processing-install.html) page.

Alternatively, the scripts may be extracted directly from the source tarball.

Update Prolog
-------------

    /usr/share/supremm/slurm/slurm-prolog

* Should be merged into your existing prolog script
* Will run data collection at job start time
* Will collect 3 additional samples at 10 second intervals

Update Epilog
-------------

    /usr/share/supremm/slurm/slurm-epilog

* Should be merged into your existing epilog script
* Will run data collection at job end time
