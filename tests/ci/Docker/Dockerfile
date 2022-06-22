FROM tools-ext-01.ccr.xdmod.org/xdmod-10.0.0:centos7.9-0.6
ENV REL=10.0.0
ENV BUILD=1.0
ENV BRANCH=xdmod10.0
ENV IS_JOB_PERFORMANCE=1

LABEL authors="Joseph P. White <jpwhite4@buffalo.edu>, Benjamin D. Plessinger <bpless@buffalo.edu>"

COPY assets/mongodb-org-3.4.repo /etc/yum.repos.d
RUN yum install -y \
    mongodb-org \
    https://github.com/ubccr/xdmod-supremm/releases/download/v$REL/xdmod-supremm-$REL-$BUILD.el7.noarch.rpm
RUN yum clean all
RUN rm -rf /var/cache/yum
ADD . /root

WORKDIR /root

# Copy XDMoD configuration files and fix defaults

RUN sed -i 's/^#nojournal = true/nojournal = true/; s/^#noprealloc = true/noprealloc = true/' /etc/mongod.conf

# Start services, setup database and ingest SUPReMM data.
# note that we make sure to clean shutdown the database so the data are flushed properly
RUN ~/bin/services start && \
    mongod -f /etc/mongod.conf && \
    ~/bin/importmongo.sh && \
    wget -nv https://raw.githubusercontent.com/ubccr/xdmod-supremm/$BRANCH/tests/integration_tests/scripts/mongo_auth.mongojs && \
    mongo mongo_auth.mongojs && \
    rm -rf mongo_auth.mongojs && \
    mongod -f /etc/mongod.conf --shutdown && \
    mongod -f /etc/mongod.conf --auth && \
    wget -nv https://raw.githubusercontent.com/ubccr/xdmod-supremm/$BRANCH/tests/integration_tests/scripts/xdmod-setup.tcl && \
    expect xdmod-setup.tcl | col -b && \
    rm -rf xdmod-setup.tcl && \
    aggregate_supremm.sh && \
    acl-config && \
    mongod -f /etc/mongod.conf --shutdown && \
    ~/bin/services stop
