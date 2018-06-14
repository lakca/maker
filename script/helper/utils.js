'use strict';

const fs = require('fs');
const path = require('path');

exports.ensureFolder = function(dir) {
  dir.split(path.sep).reduce((prev, cur) => {
    const p = path.join(prev, cur);
    try {
      fs.accessSync(p, fs.constants.F_OK);
    } catch (e) {
      fs.mkdirSync(p);
    }
    return p;
  }, path.sep);
};
