#!/bin/bash
# Install mongo server and php extensions.


cat << EOF > /etc/yum.repos.d/mongodb-org-4.4.repo
[mongodb-org-4.4]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/8/mongodb-org/4.4/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-4.4.asc
EOF

dnf install -y mongodb-org php-devel

yes '' | pecl install mongodb-1.19.2

echo "extension=mongodb.so" > /etc/php.d/40-mongodb.ini
