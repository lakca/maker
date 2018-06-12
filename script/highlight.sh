#!/bin/bash

repeat() {
  str=$(printf "%$1s")
  echo ${str// /-}
}

log() {
  str=$1
  len=$((${#str}+4))
  wrap=`repeat $len`
  l2='| '$str' |';
  echo "\033[31m $wrap \033[0m"
  echo "\033[31m $l2 \033[0m"
  echo "\033[31m $wrap \033[0m"
}

entry=`pwd`
tmpDir='highlight.js-'`date +%s`
curDir=`dirname $(realpath $0)`

cd $curDir

log 'mkdir '$tmpDir
mkdir $tmpDir
cd $tmpDir

log 'clone highlight.js'
git clone https://github.com/isagalaev/highlight.js.git
cd highlight.js
npm install

log 'start build highlight.js'
node tools/build.js -t cdn
log 'build done.'

mv build ../../../static/highlight
cd ../../
rm -rf $tmpDir

cd $entry