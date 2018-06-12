#!/bin/bash

entry=`pwd`
tmpFolder='md-'`date +%s`
curDir=`dirname $(realpath $0)`
mdDir=`cd $curDir && cd .. && pwd`/md

if [ !-d $mdDir ];then
  mkdir $mdDir
fi

cd $curDir
mkdir $tmpFolder
cd $tmpFolder

git clone https://github.com/lakca/note.git
cd note
mv article $mdDir

if [ -f 'LICENSE' ];then
  cp LICENSE $mdDir/license.md
fi

cd $curDir;
sh highlight.sh
node style.js
node md.js

rm -rf $tmpFolder
cd $entry