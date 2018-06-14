#!/bin/bash

log() {
  echo -e "\033[31m $1 \033[0m"
}

entry=`pwd`
tmpDir='highlight.js-'`date +%s`
curDir=`dirname $(realpath $0)`
staticDir=`cd $curDir && cd .. && pwd`/static

cd $curDir

log 'mkdir '$tmpDir
mkdir $tmpDir
cd $tmpDir

log 'clone highlight.js'
git clone https://github.com/isagalaev/highlight.js.git
cd highlight.js
npm install

node tools/build.js -t cdn

if [ ! -d $staticDir ];then
  mkdir $staticDir
fi

mv build $staticDir/highlight
cd ../../

log 'rm '$tmpDir
rm -rf $tmpDir

cd $entry