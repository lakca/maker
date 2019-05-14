import { readFile } from 'fs'
import { resolve, extname } from 'path'
import { safeLoad } from 'js-yaml'
import parser = require('./lib/parser')
const debug = require('debug')('maker:entry')
import { configInterface, optionsInterface, contextInterface } from './interface'

async function readFileText(filename): Promise<string> {
  return new Promise(function(resolve, reject) {
    readFile(filename, function(err, buf) {
      if (err)
        reject(err)
      else
        resolve(buf.toString())
    })
  })
}

async function readConfig(configFile: string): Promise<object> {
  if (['.yml', '.yaml'].includes(extname(configFile))) {
    return readFileText(configFile)
      .then(str => safeLoad(str))
  } else {
    return new Promise(function (resolve) {
      process.nextTick(function() {
        resolve(require(configFile))
      })
    })
  }
}

export = async function(options: optionsInterface) {
  debug('input configuration: %o', options)
  const configFile: string = options.configFile || resolve(options.cwd, 'config.yml')
  const config: configInterface = await readConfig(configFile)
  const text: string = await readFileText(options.file)
  debug('configuration: %o', config)
  return parser(merge(config, options), text)
}

function merge(config: configInterface, options: optionsInterface): contextInterface {
  return Object.assign({}, config, options)
}