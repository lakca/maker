const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const uglify = require('gulp-uglify')
const buffer = require('vinyl-buffer')
const ts = require('gulp-typescript')

gulp.task('watch', function() {
  gulp.watch('./src/public/*.js', gulp.parallel(['jsfile']))
  gulp.watch('./src/**/*.ts', gulp.parallel(['typescript']))
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

const tsProject = ts.createProject('tsconfig.json')
gulp.task('typescript', function() {
  const entry = path.join(__dirname, 'src/**/*.ts')
  const tsResult = gulp.src([entry])
    .pipe(tsProject())
  return tsResult.js.pipe(gulp.dest('./dist/'))
})