import marked from 'marked'
import highlight from './highlight'
import Renderer from './renderer'
import sanitizer from './sanitizer'

export = async function(
  ctx: {
    config: {
      silent: boolean
      permalink: boolean,
      webRoot: string
    },
    options: {

    }
  },
  text: string | Buffer
) {
  const parseOptions = {
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
    silent: ctx.config.silent,
    smartyLists: true,
    smartypants: true,
    tables: true,
    xhtml: false,
    baseUrl: ''
  }
  /* use permalink */
  if (ctx.config.permalink) {
    parseOptions.baseUrl = ctx.config.webRoot
  }

  marked(text, parseOptions, function(err, output) {
    if (err) {
      throw err
    } else {
      console.log('output---:', output)
    }
  })
}