#!/bin/bash

log() {
  echo -e "\033[31m $1 \033[0m"
}

entry=`pwd`
curDir=`dirname $(realpath $0)`

cd $curDir

log 'build highlight.js'
sh highlight.sh

log 'build style'
node style.js

log 'build markdown'
node md.js

cd $entry