
import { Renderer } from 'marked'

function stringifyAttr(key: string, val: string|number): string
function stringifyAttr(key: string, val: boolean): string
function stringifyAttr(key: string, val: [string|number]): string
function stringifyAttr(key: string, val: {[index: string]: any}): string
function stringifyAttr(key: string, val: any): any {
  switch (typeof val) {
    case 'string':
    case 'number':
      return `${key}="${val}"`
    case 'boolean':
      return key
    case 'object':
      if (Array.isArray(val))
        return val.join(' ')
      return Object.keys(val).reduce((p, k) => `${p};${k}:${val[k]}`, '') || ''
    default:
  }
}

// helper
function stringifyAttrsHash(obj: object = Object.create(null)): string {
  return Object.keys(obj).reduce((str, key) => {
    return str + ' ' + stringifyAttr(key, obj[key])
  }, '')
}

function renderTag(
  tagName: string,
  inner: string = '',
  attrs: object = {}
): string {
  tagName = tagName.toLowerCase()
  return `<${tagName}${attrs && stringifyAttrsHash(attrs) || ''}>` +
    inner +
    `</${tagName}>`
}

export = class MyRenderer extends Renderer {
  constructor(options?: object) {
    super(options)
  }

  private headerTree: [string, string][] = []

  private growHeaderTree(level, text): void {
    this.headerTree.push([level, text])
  }

  private getHeaderId(): string {
    const tree = this.headerTree
    const ids: number[] = []
    let count: number = 1
    let n: number = tree.length
    if (n < 2) {
      ids.push(n)
    } else {
      n--
      ids.push(n)
      while (n--) {
        if (tree[n][0] === tree[n + 1][0]) {
          count++
        } else {
          ids.push(count)
          count = 1
        }
      }
    }
    return ids.reverse().join('-')
  }

  public heading(text, level, raw): string {
    this.growHeaderTree(level, text)
    const attrs = Object.create(null)
    attrs.id = 'h-' + this.getHeaderId()
    return renderTag('h' + level, text, attrs)
  }

  public paragraph2(text): string {
    if (text === '[toc]') {
      return ''
    } else {
      return renderTag('p', text)
    }
  }

  public code(code, lang, escaped) {
    console.log(lang, escaped)
    console.log(code)
    return super.code(code, lang, escaped)
  }
}