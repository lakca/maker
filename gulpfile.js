const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const uglify = require('gulp-uglify')
const buffer = require('vinyl-buffer')

gulp.task('watch', function() {
  gulp.watch('./src/public/*.js', gulp.parallel(['jsfile']))
})

function isJsFile(file) {
  return /\.js$/.test(file)
}

const jsFolder = path.join(__dirname, 'src/public')
gulp.task('jsfile', function() {
  fs.readdirSync(jsFolder).forEach(file => {
    console.log(file)
    if (!isJsFile(file)) return
    browserify({
      entries: [path.join(jsFolder, file)],
    })
    .bundle()
    .pipe(source(file))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./public/static'))
  })
  return Promise.resolve()
})