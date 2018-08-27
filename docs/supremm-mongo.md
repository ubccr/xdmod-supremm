---
title: Install MongoDB
---

A MongoDB server must be installed and enabled. We recommend that the software 
is installed on a dedicated server, however it may be installed on the same
server as the XDMoD instance.

A quick start guide to installing MongoDB on Centos is listed below. Please refer to the official [MongoDB installation manual](https://docs.mongodb.org/manual/installation/) for full instructions on how to install on other Linux distributions.

Note that the default install has access control disabled.  Please see the
[MongoDB documentation](https://docs.mongodb.org/manual) for instructions on
how to set up access controls for the database instance.

### Centos 7

    # yum install mongodb-server mongodb
    # systemctl enable mongod
    # systemctl start mongod
