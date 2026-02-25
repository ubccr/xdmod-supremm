#!/bin/bash

BASEPATH=/import
mongo_uri="mongodb://root:xdmod@localhost/supremm?authSource=admin"

for dbpath in $BASEPATH/*
do
    dbname=`basename $dbpath`
    for collectionpath in $dbpath/*
    do
        collection=`basename $collectionpath`
        for doc in $collectionpath/*.json
        do
            tr -d '\n' < $doc | mongoimport $mongo_uri --db $dbname --collection $collection
        done
    done
done
