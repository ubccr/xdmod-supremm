#!/bin/bash

if [ "$XDMOD_TEST_MODE" = "fresh_install" ];
then
    # note this will aslo remmove the existing xdmod-supremm rpm
    # not a problem since it would have been removed in the xdmod bootstrap
    # later in the build
    yum remove -y nodejs npm
else
    # The package names are different between the (no longer available) EPEL versions a
    # the nodesource ones. The xdmod-supremm RPM depends on npm must it must be removed
    # in order to install the nodesource version. The following will remove it without
    # uninstalling xdmod-supremm (thus allowing us to test an upgrade). We need the latest
    # version of nodejs installed in order to generate the RPM.
    rpm -e --nodeps npm
fi

yum install -y https://rpm.nodesource.com/pub_16.x/el/7/x86_64/nodesource-release-el7-1.noarch.rpm
yum install -y nodejs

# The UI tests need nodejs 6 so also install the software collections
# when the UI tests run they will use the softweare collections version
yum install -y centos-release-scl-rh
yum install -y rh-nodejs6
