const marked = require('marked');
const highlight = require('highlight.js');
const minifyHTML = require('html-minifier').minify;
const path = require('path');
const fs = require('fs');
const promisify = require('util').promisify;
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const fstat = promisify(fs.stat);
const mdDir = path.join(__dirname, '..', 'md');
const htmlDir = path.join(__dirname, '..', 'html');

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

function parseMarkdown(md, before, after) {
  let html;
  if (before) before();
  try {
    html = marked(md);
    if (after) after();
  } catch (e) {
    if (after) after();
    throw e;
  }
  return html;
}

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

function _getFlowTitle(flow) {
  return flow.title || flow.filename;
}

function generateNav(flow = []) {
  const blocks = [];
  let index = flow.length - 1;
  blocks[index] = `<a>${_getFlowTitle(flow[index])}</a>`;
  index--;
  blocks[index] = `<a href="./">${_getFlowTitle(flow[index])}</a>`;
  index--;
  while(index >=0) {
    const rep = flow.length - 2 - index;
    blocks[index] = `<a href="${'../'.repeat(rep)}">${_getFlowTitle(flow[index])}</a>`;
    index--;
  }
  return `${blocks.join('<span class="sep">></span>')}`;
}

async function writeHTML(filePath, content, options) {
  const flow = options.flow;
  const html = '<html><head>' +
    '<meta charset="utf-8"/>' +
    '<script src="/static/highlight/highlight.min.js"></script>' +
    '<script src="/static/highlight/languages/javascript.min.js"></script>' +
    '<link rel="stylesheet" href="/static/main.css"/>' +
    '<link rel="stylesheet" href="/static/markdown.css"/>' +
    '<link rel="stylesheet" href="/static/highlight/styles/monokai-sublime.min.css"/>' +
    '</head><body>' +
    '<div class="main-container">' +
    '<div class="main-nav">' + generateNav(flow) + '</div>' +
    '<div class="markdown-body">' +
    content +
    '</div>' +
    '</div>' +
    '</body></html>'
  const miniHTML = minifyHTML(html, {
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    preserveLineBreaks: false,
    removeComments: true
  });
  await writeFile(filePath, miniHTML);
}

async function travel(dir, catalog) {
  const files = await readdir(dir);
  if (files.length) ensureDir(catalog.outputPath);
  const ex = files.map(file => {
    const filePath = path.join(dir, file);
    return fstat(filePath).then(stat => {
      if (stat.isFile() && path.extname(file).toLowerCase() === '.md') {
        const filename = path.basename(file, path.extname(file));
        const obj = {
          type: 'file',
          filename: filename,
          realPath: filePath,
          outputPath: path.join(catalog.outputPath, filename + '.html'),
          title: '',
          flow: [...catalog.flow]
        };
        obj.flow.push(obj);
        catalog.children.push(obj);
      } else if (stat.isDirectory()) {
        const obj = {
          type: 'folder',
          filename: file,
          realPath: filePath,
          outputPath: path.join(catalog.outputPath, file),
          children: [],
          flow: [...catalog.flow]
        };
        obj.flow.push(obj);
        catalog.children.push(obj);
        return travel(filePath, obj);
      }
    });
  });
  await Promise.all(ex);
}

async function generate(catalog) {
  if (catalog.type === 'folder') {
    const folder = catalog.realPath;
    await Promise.all(catalog.children.map(c => {
      return generate(c);
    }));
    // generate summary file.
    const lines = ['# 目录'];
    for (const c of catalog.children) {
      lines.push(` - [${c.title || c.filename}](./${c.filename}.html)`);
    }
    const summary = lines.join('\n');
    const summaryHTML = parseMarkdown(summary);
    await writeHTML(path.join(catalog.outputPath, 'summary.html'), summaryHTML, {
      flow: [...catalog.flow, {
        title: 'summary'
      }]
    });
  } else if (catalog.type === 'file') {
    const content = await readFile(catalog.realPath);
    const oldHeading = marked.Renderer.prototype.heading;
    const html = parseMarkdown(content.toString(), function () {
      marked.Renderer.prototype.heading = function (text, level, raw) {
        if (!catalog.title && level === 1) {
          catalog.title = text;
        }
        return oldHeading.apply(this, arguments);
      };
    }, function () {
      marked.Renderer.prototype.heading = oldHeading;
    });
    await writeHTML(catalog.outputPath, html, {
      flow: catalog.flow
    });
  }
}

(async function() {
  const catalog = {
    type: 'folder',
    title: '首页',
    filename: '',
    realPath: mdDir,
    outputPath: htmlDir,
    children: []
  };
  catalog.flow = [catalog];
  await travel(mdDir, catalog);
  await generate(catalog);
  console.log(catalog);
}()).catch(console.error);
