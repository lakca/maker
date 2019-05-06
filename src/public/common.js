
var maker = window.maker = {}

var loaded = []

exports.loadScript = function () {
  if (loaded.indexOf(src))
    return
  var script = document.createElement('script')
  script.src = src
  document.head.appendChild(script)
  script.onload = function () {
    loaded.push(src)
    cb()
  }
}