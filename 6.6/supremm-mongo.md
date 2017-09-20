---
title: Install MongoDB
---

A MongoDB server should be installed and enabled. This may be installed on a dedicated host
or on the same host as the SUPReMM summarization software or Open XDMoD software.

A quick start guide to installing MongoDB on Centos is listed below. Please refer to the official [MongoDB installation manual](https://docs.mongodb.org/manual/installation/) for full instructions on how to install on other Linux distributions.

Please see the [MongoDB documentation](https://docs.mongodb.org/manual) for instructions on how to set up access controls for the database instance.

### Centos 6

    # yum install mongodb-server mongodb
    # chkconfig mongod on
    # service mongod start

### Centos 7

    # yum install mongodb-server mongodb
    # systemctl enable mongod
    # systemctl start mongod
