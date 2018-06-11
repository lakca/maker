const marked = require('marked');
const highlight = require('highlight.js');
const cssJson = require('./css-json');
const minifyHTML = require('html-minifier').minify;
const path = require('path');
const fs = require('fs');
const promisify = require('util').promisify;
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const fstat = promisify(fs.stat);
const parse = promisify(marked);
const mdDir = path.join(__dirname, '..', 'md');
const htmlDir = path.join(__dirname, '..', 'html');
const staticDir = path.join(__dirname, '..', 'static');

// copy github markdown style.
const githubStyle = fs.readFileSync(require.resolve('github-markdown-css')).toString();
const githubStyleObj = cssJson.toJSON(githubStyle);
// handle error handle of @font-face.url
githubStyleObj.children['@font-face'].attributes.src = githubStyleObj.children['@font-face'][1];
delete githubStyleObj.children['.markdown-body code'].attributes['background-color'];
delete githubStyleObj.children['.markdown-body pre>code'].attributes['background'];
delete githubStyleObj.children['.markdown-body pre code'].attributes['background-color'];
delete githubStyleObj.children['.markdown-body pre code'].attributes['display'];
githubStyleObj.children['.markdown-body'] = {
  attributes: {
    width: '960px',
    margin: '50px auto'
  }
};
githubStyleObj.children['.markdown-body code'] = {
  attributes: {
    padding: '10px!important',
    'border-radius': '3px'
  }
};
fs.writeFileSync(path.join(staticDir, 'markdown.css'), cssJson.toCSS(githubStyleObj));

marked.setOptions({
  renderer: new marked.Renderer(),
  highlight: function (code) {
    return highlight.highlightAuto(code).value;
  },
  langPrefix: 'hljs language-',
  pedantic: false,
  gfm: true,
  tables: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
});

function ensureDir(dir) {
  dir.split(path.sep).reduce((prev, cur) => {
    const p = path.join(prev, cur);
    try {
      fs.accessSync(p, fs.constants.F_OK);
    } catch (e) {
      fs.mkdirSync(p);
    }
    return p;
  }, path.sep);
}

async function write(filePath, content) {
  content = '<html><head>' +
    '<meta charset="utf-8"/>' +
    '<script src="/static/highlight/highlight.min.js"></script>' +
    '<script src="/static/highlight/languages/javascript.min.js"></script>' +
    '<link rel="stylesheet" href="/static/highlight/styles/monokai-sublime.min.css"/>' +
    '<link rel="stylesheet" href="/static/markdown.css"/>' +
    '</head><body>' +
    '<div class="markdown-body">' +
    content +
    '</div>' +
    '</body></html>'
  content = minifyHTML(content, {
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    preserveLineBreaks: false,
    removeComments: true
  });
  await writeFile(filePath, content);
}

async function exec(dir, toDir) {
  const files = await readdir(dir);
  if (files.length) ensureDir(toDir);
  const ex = files.map(file => {
    const filePath = path.join(dir, file);
    return fstat(filePath).then(stat => {
      if (stat.isFile() && path.extname(file).toLowerCase() === '.md') {
        return readFile(filePath).then(c => {
          return parse(c.toString());
        }).then(html => {
          return write(path.join(toDir, file.replace(/\.md$/i, '.html')), html);
        });
      } else if (stat.isDirectory()) {
        return exec(filePath, path.join(toDir, file));
      }
    });
  });
  await Promise.all(ex);
}

(async function() {
  await exec(mdDir, htmlDir);
}()).catch(console.error);
