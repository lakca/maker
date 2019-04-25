const marked = require('marked');
const highlight = require('./lib/highlight')
const Renderer = require('./lib/renderer')
const sanitizer = require('./lib/sanitizer')
const fs = require('fs')
const path = require('path')

module.exports = function(ctx, text) {
  const { config } = ctx
  const options = {
    gfm: true,
    breaks: true,
    headerIds: true,
    headerPrefix: 'h-',
    highlight: highlight,
    langPrefix: 'lang',
    mangle: true,
    pedantic: false,
    renderer: new Renderer(),
    sanitize: true,
    sanitizer: sanitizer,
    silent: config.silent,
    smartyLists: true,
    smartypants: true,
    tables: true,
    xhtml: false
  }

  if (config.permalink) {
    options.baseUrl = config.webRoot
  }

  marked(text, options, function(err, output) {
    if (err) {
      throw err
    } else {
      console.log('output---:', output)
    }
  })
}

module.exports({
  config: {
    silent: false
  }
}, fs.readFileSync(path.join(__dirname, '../examples/hello.md')).toString())