const { Renderer } = require('marked')

// helper
function stringifyAttrObj(obj) {
  const items = []
  for (const key in obj) {
    val = ''
    if (typeof obj[key] === 'object') {
      if (Array.isArray(obj[key])) {
        val = obj[key].join(' ')
      } else {
        for (const k in obj[key]) {
          val += k + ':' + obj[key][k] + ';'
        }
      }
    } else {
      val += obj[key]
    }
    items.push(`${key}="${val}"`)
  }
  return ' ' + items.join(' ') + ' '
}

function tag(tagName, inner, attrs) {
  tagName = tagName.toLowerCase()
  return `<${tagName}${attrs && stringifyAttrObj(attrs) || ''}>${inner}</${tagName}>`
}

function MyRenderer(options) {
  Renderer.call(this, options)
  this._headerTree = []
}

const proto = MyRenderer.prototype

Object.setPrototypeOf(proto, Renderer.prototype)

proto._growHeaderTree = function (level, text) {
  this._headerTree.push([level, text])
}

proto._getHeaderId = function () {
  const tree = this._headerTree
  const ids = []
  let n = tree.length
  let count = 1
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

proto.heading = function (text, level, raw) {
  this._growHeaderTree(level, text)
  const attrs = Object.create(null)
  attrs.id = 'h-' + this._getHeaderId()
  return tag('h' + level, text, attrs)
}

proto.paragraph2 = function (text) {
  if (text === '[toc]') {
    return ''
  } else {
    return tag('p', text)
  }
}

module.exports = MyRenderer
