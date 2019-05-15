import marked from 'marked'
import { safeLoad } from 'js-yaml'
import { contextInterface, postMetaInterface } from '../interface'
import highlight from './highlight'
import Renderer from './renderer'
import sanitizer from './sanitizer'
import { readFileTextAsync } from '../helper'

export = async function(opts: contextInterface, text?: string) {

  if (!text) {
    text = await readFileTextAsync(opts.file)
  }

  text = cleanRawText(text)

  const parts = extractRawText(text)

  const meta: postMetaInterface = parseMeta(parts.meta)

  const content: string = await parseContent(parts.content, opts)

  return {
    meta,
    content
  }
}

function cleanRawText(text: string): string {
  return text.trim()
}

function extractRawText(text: string) {
  const parts: {
    content: string
    meta?: string
  } = {
    content: ''
  }
  /* extract meta part */
  text = text.replace(/^```\s*$([^(^```$)]+)^```\s*$/m,
    function(whole: string, metaPart?: string) {
      parts.meta = metaPart
      return ''
    }
  ).trim()

  parts.content = text

  return parts
}

function parseMeta(text?: string): object {
  if (text)
    return safeLoad(text)
  return {}
}

function parseContent(text: string, opts): Promise<string> {
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
    silent: opts.silent,
    smartyLists: true,
    smartypants: true,
    tables: true,
    xhtml: false,
    baseUrl: ''
  }
  /* use permalink */
  if (opts.usePermalink) {
    parseOptions.baseUrl = opts.webRoot
  }
  return new Promise((resolve, reject) => {
    marked(text, parseOptions, function (err, output) {
      /* since marked is actually sync. */
      process.nextTick(function() {
        if (err) {
          reject(err)
        } else {
          resolve(output)
        }
      })
    })
  })
}