import { readFile } from 'fs'
import { resolve, extname } from 'path'
import { safeLoad } from 'js-yaml'
import { promisify } from 'util'
import parser = require('./lib/parser')
const debug = require('debug')('maker:entry')

async function readConfig(configFile: string) {
  if (['.yml', '.yaml'].includes(extname(configFile))) {
    return promisify(readFile)(configFile)
      .then(buf => buf.toString())
      .then(yaml => safeLoad(yaml))
  } else {
    return require(configFile);
  }
}

export = async function(options: {
  cwd: string
  file: string
  config?: string
  output?: string
  /* post */
  passcode?: string
  title?: string
  description?: string
  keywords?: string[]
  tags?: string[]
  categories?: string[]
}) {
  debug('input configuration: %o', options)
  const configFile: string = options.config || resolve(options.cwd, 'config.yml')
  const [ config, text ] = await Promise.all([
    readConfig(configFile),
    promisify(readFile)(options.file)
  ])
  debug('configuration: %o', config)
  return parser({ config, options }, text)
}
