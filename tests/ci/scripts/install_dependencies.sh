#!/bin/bash

# The UI tests need nodejs 6 so also install the software collections
# when the UI tests run they will use the softweare collections version
yum install -y centos-release-scl-rh
yum install -y rh-nodejs6 nodejs
