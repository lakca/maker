const { safeLoad } = require('js-yaml')
const readline = require('readline')
const fs = require('fs')

function read(filename) {
  return new Promise(function (resolve, reject) {
    const rl = readline.createInterface({
      input: fs.createReadStream(filename)
    })
    let n = 0
    let range = []
    let meta = ''
    rl.on('error', reject)
    rl.on('close', function () {
      try {
        resolve(safeLoad(meta))
      } catch(e) {
        reject(e)
      }
    })
    rl.on('line', function (line) {
      n++
      if (!/\S/.test(line))
        return
      if (/^\s*`{3,}\s*$/.test(line))
        return range.push(n)
      if (range[1])
        return rl.close()
      if (range[0]) {
        meta += line + '\n'
      }
    })
  })
}

read(require('path').join(__dirname, 'examples/hello.md')).then(console.log)