#!/bin/bash 
# Absolute path to this script, e.g. /home/user/bin/foo.sh
SCRIPT=$(readlink -f "$0")
# Absolute path this script is in, thus /home/user/bin
SCRIPTPATH=$(dirname "$SCRIPT")

cd $SCRIPTPATH
sudo systemctl stop coconutbot.service
git pull
npm install
npx tsc
sudo systemctl start coconutbot.service

exit 0;