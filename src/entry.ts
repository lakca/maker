import { safeLoad } from 'js-yaml'
import { extname, join, isAbsolute } from 'path'
import { configInterface, optionsInterface, contextInterface } from './interface'
import { readFileText, isFile, parseSimpleTemplate, writeFileRecursive } from './helper'
import parser = require('./lib/parser')
const debug = require('debug')('maker:entry')
const ejs = require('ejs')

async function loadConfig(configFile: string): Promise<configInterface> {
  if (['.yml', '.yaml'].includes(extname(configFile))) {
    const str = await readFileText(configFile)
    console.log(str)
    return safeLoad(str)
  } else {
    return new Promise(function (resolve) {
      process.nextTick(function() {
        resolve(require(configFile))
      })
    })
  }
}

const defaultConfig: configInterface = {
  web_root: 'http://localhost:8090',
  theme: 'string',
  output: 'dist',
  post_name: '{title}',

  use_permalink: false,
  has_catagory: false,
  has_tag: false,
  has_search: false,

  title: 'blog',
  description: 'this is default description.',
  keywords: [],

  silent: true,
}

async function merge(config: configInterface, options: optionsInterface): Promise<contextInterface> {
  const ctx = <contextInterface>Object.assign({}, defaultConfig, config)
  ctx.cwd = options.cwd
  if (await isFile(options.file)) {
    ctx.file = options.file
  } else {
    ctx.folder = options.file
  }
  return ctx
}

async function getStaticConfig(cwd, filename) {
  const configFile = filename ?
    isAbsolute(filename) ?
    filename :
    join(cwd, filename) :
    join(cwd, 'config.yml')
  return loadConfig(configFile)
}

module.exports = async function(options: optionsInterface) {
  debug('input opts: %O', options)
  const staticConfig = await getStaticConfig(options.cwd, options.configFile)
  const mergedConfig = await merge(staticConfig, options)
  debug('config: %O', mergedConfig)

  const result = await parser(mergedConfig, await readFileText(mergedConfig.file))
  console.log(result)
  return result
}

module.exports.create = async function(name, options) {
  debug('name: %s, options: %O', name, options)
  const type = options.type || 'default'
  const tmpl = await readFileText(join(options.cwd, `templates/${type}.md`))
  const config = await getStaticConfig(options.cwd, options.configFile)
  const date = new Date()
  const context = {
    config,
    title: name,
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    timestamp: date.getTime()
  }
  const filename = parseSimpleTemplate(
    config.post_name,
    context,
    ['<', '>']
  )
  const text = parseSimpleTemplate(
    tmpl,
    context,
    ['{', '}']
  )
  return writeFileRecursive(
    join(options.cwd, `source/${filename}.md`),
    text
  )
}