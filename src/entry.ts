import { resolve } from 'path'
import { configInterface } from './interface'
import { readFileTextAsync, renderSimpleTemplate, writeFileRecursiveAsync, loadConfigFromFileAsync, eachFile } from './helper'
import parser = require('./lib/parser')
import PostLoader from './lib/post_loader'
import { promisify } from 'util'
import { renderFile as renderEjsFile, render as renderEjs } from 'ejs'
import { readFileSync } from 'fs';
const renderEjsFileAsync = promisify(renderEjsFile)
const debug = require('debug')('maker:entry')

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

async function loadConfig(cwd, file) {
  if (file) {
    return loadConfigFromFileAsync(resolve(cwd, file))
  }
  const files = [
    'config.json',
    'config.js',
    'config.yaml',
    'config.yml'
  ]
  for (const file of files) {
    const config = await loadConfigFromFileAsync(resolve(cwd, file))
    if (config) return config
  }
}

exports.create = async function(name, options) {
  debug('name: %s, options: %O', name, options)
  const type = options.type || 'default'
  const tmplFile = resolve(options.cwd, `templates/${type}.md`)
  const template = await readFileTextAsync(tmplFile)
  const config = await loadConfig(options.cwd, options.config)
  const date = new Date()
  const time = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    H: date.getHours(),
    M: date.getMinutes(),
    S: date.getSeconds()
  }
  const context = {
    config,
    title: name,
    title2: name.replace(/\s/g, '_'),
    y: time.y,
    m: time.m,
    d: time.d,
    H: time.H,
    M: time.M,
    S: time.S,
    timestamp: date.getTime(),
    time: `${time.y}-${time.m}-${time.d} ${time.H}:${time.M}:${time.S}`
  }
  const filename = renderSimpleTemplate(
    config.post_name,
    context,
    ['<', '>']
  )
  const text = renderSimpleTemplate(
    template,
    context,
    ['{', '}']
  )
  return writeFileRecursiveAsync(
    resolve(options.cwd, `source/${filename}.md`),
    text
  )
}

exports.build = async function(options: {
  cwd: string
  config?: string
  output?: string
}) {
  debug('input options: %O', options)
  const sourceFolder = resolve(options.cwd, 'source')
  const outputFolder = resolve(options.cwd, 'output')
  const themeFolder = resolve(options.cwd, 'theme')
  const config = await loadConfig(options.cwd, options.config)
  debug('config: %O', config)
  // post files
  const posts = await eachFile(sourceFolder)
  await Promise.all(posts.map(file => {
    const postLoader = new PostLoader(resolve(sourceFolder, ...file), {
      web_root: config.web_root
    })
    return async function() {
      await postLoader.load()
      const post = postLoader.toJSON()
      const site = config
      const html = await renderEjsFileAsync(resolve(themeFolder, 'post-single.ejs'), {
        post,
        site
      }, {
        root: themeFolder
      })
      const filename = file.join('/').replace(/\.md$/, '.html')
      await writeFileRecursiveAsync(resolve(outputFolder, 'post', filename), html)
    }()
  }))
}