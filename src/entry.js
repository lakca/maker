const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const promisify = require('util');
const configFile = path.join(__dirname, '../config.yml')
// const config = yaml.safeLoad(fs.readFileSync(configFile))

function getConfig(config) {
  const file = path.resolve(__dirname, '..', config);
  if (/\.(yaml|yml)$/.test(config)) {
    return yaml.safeLoad(file);
  } else {
    return require(file);
  }
}

module.exports = async function({
  cwd,
  file,
  config,

  title,
  description,
  keywords,
  tags,
  categories,

  dist
}) {
  return console.log(arguments[0])
  file = path.resolve(__dirname, '..', file)
  config = getConfig(config)
  const content = await promisify(fs.readFile)(file)
  console.log(content)
}