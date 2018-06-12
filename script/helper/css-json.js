const vm = require('vm');
const fs = require('fs');
const path = require('path');
const cssJsonPath = require.resolve('css-to-json');
const json2Code = fs.readFileSync(path.resolve(cssJsonPath, '../json2.js')).toString();
const cssJsonCode = fs.readFileSync(cssJsonPath).toString();
const key = 'CSSJSON' + Date.now();
const sandbox = {};
sandbox[key] = '';
const code = json2Code + cssJsonCode + `;${key} = CSSJSON`;
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

module.exports = sandbox[key];
