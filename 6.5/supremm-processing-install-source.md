---
title: SUPReMM Summarization package source installation guide
---

Install source package
----------------------

    $ tar xf supremm-x.x.x.tar.gz
    $ cd supremm-x.x.x
    $ python setup.py install --prefix [PREFIX]

where [PREFIX] is the full path to the desired install location (e.g. /usr/local)

Set environment variables
-------------------------

If the package is installed in a non-system standard location, then the PYTHONPATH environment
variable should be set so that the python interpreter can find the modules.

The exact path that needs to be set depends on the python version.  For python
2.6 on RedHat-based 64-bit Linux installs this is typically:

    export PYTHONPATH=[PREFIX]/lib64/python2.6/site-packages:$PYTHONPATH

and python 2.7 is often:

    export PYTHONPATH=[PREFIX]/lib64/python2.7/site-packages:$PYTHONPATH

32-bit installs will typically use `lib` rather than `lib64` and some
distributions default to `lib` even on x86_64 architectures.

The executable scripts are all installed in the `bin` directory under the
install prefix.  Optionally, you can add this path to the PATH environment
variable so that the scripts can be executed without specifying the full path
each time:

    export PATH=[PREFIX]/bin:$PATH

where [PREFIX] is the full path to install location.

Configure Job Summarization software
------------------------------------

See the [Configuration Guide](supremm-processing-configuration.html) for details.
