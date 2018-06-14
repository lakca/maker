#!/bin/bash

log() {
  echo -e "\033[31m $1 \033[0m"
}

entry=`pwd`
tmpFolder='md-'`date +%s`
curDir=`dirname $(realpath $0)`
mdDir=`cd $curDir && cd .. && pwd`/md

cd $curDir

log 'mkdir '$tmpFolder
mkdir $tmpFolder
cd $tmpFolder

log 'clone note'
git clone https://github.com/lakca/note.git
cd note
if [ -d $mdDir ]; then
  rm -rf $mdDir
fi
mv article $mdDir

if [ -f 'LICENSE' ];then
  cp LICENSE $mdDir/license.md
fi

cd $curDir;

node md.js

log 'rm '$tmpFolder
rm -rf $tmpFolder
cd $entry