#!/bin/sh

cd main-service/
ibmcloud login -sso -r eu-gb
ibmcloud target --cf
ibmcloud cf push