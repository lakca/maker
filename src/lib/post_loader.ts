const fs = require('fs')
const readline = require('readline')
const marked = require('marked')
const { ok } = require('assert')
const { safeLoad } = require('js-yaml')
const highlight = require('./highlight')
const Renderer = require('./renderer')
const sanitizer = require('./sanitizer')
import { postObject } from "../interface";

export = class PostLoader {
  constructor(private readonly filename, private readonly options: {
    root: string
    web_root: string
    silent?: boolean
    use_permalink?: boolean
    [x: string]: any
  }) {}

  private hasRead: boolean = false
  private _meta: postObject|undefined
  private htmlBuffer: Buffer = Buffer.allocUnsafe(0)

  private set meta(v) {
    this._meta = Object.assign({
      /* id: string | number
      title: string
      content: string
      keywords: string[]
      categories: string[]
      tags: string[]
      author: string
      permalink: string
      date: Date */
      tags: [],
      categories: [],
      keywords: [],
      date: new Date(),
      author: 'annoymous'
    }, v)
  }

  private get meta() {
    ok(this.hasRead, 'post data has not been read, call load() instead.')
    return this._meta
  }

  async load(items?: string[]) {
    if (!this.hasRead) {
      await this.read()
      this.hasRead = true
    }
  }

  get html() {
    ok(this.hasRead, 'post data has not been read, call load() instead.')
    return this.htmlBuffer.toString()
  }

  toJSON(): postObject {
    const post = JSON.parse(JSON.stringify(this.meta))
    post.html = this.html
    return post
  }

  private async read(): Promise<void> {
    return new Promise((resolve, reject) => {

      if (this.hasRead) {
        return resolve()
      }

      const rl = readline.createInterface({
        input: fs.createReadStream(this.filename)
      })
      let n = 0
      let meta = ''
      let content = ''
      let range: number[] = []
      rl.on('error', reject)
      rl.on('close', () => {
        try {
          this.meta = safeLoad(meta)
          parseMarkdown(content, this.options).then(str => {
            this.htmlBuffer = Buffer.from(str)
            resolve()
          }).catch(reject)
        } catch (e) {
          reject(e)
        }
      })
      rl.on('line', line => {
        n++
        if (!/\S/.test(line))
          return
        if (/^\s*`{3,}\s*$/.test(line))
          return range.push(n)
        if (range[1])
          return content += line + '\n'
        if (range[0]) {
          return meta += line + '\n'
        }
      })
    })
  }
}

function parseMarkdown(text: string, options): Promise<string> {
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
    silent: options.silent,
    smartyLists: true,
    smartypants: true,
    tables: true,
    xhtml: false,
    baseUrl: ''
  }
  /* use permalink */
  if (options.use_permalink) {
    parseOptions.baseUrl = options.web_root
  }
  return new Promise((resolve, reject) => {
    marked(text, parseOptions, function (err, output) {
      /* since marked is actually sync. */
      process.nextTick(function () {
        if (err) {
          reject(err)
        } else {
          resolve(output)
        }
      })
    })
  })
}