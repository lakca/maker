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
const renderFile = promisify(require('ejs').renderFile);
const { ensureFolder } = require('./helper/utils');

const mdDir = path.join(__dirname, '..', 'md');
const htmlDir = path.join(__dirname, '..', 'html');
const tplDir = path.join(__dirname, 'template');

marked.setOptions({
  renderer: new marked.Renderer(),
  highlight: function (code, language) {
    if (language) {
      return highlight.highlightAuto(code, [language]).value;
    } else {
      return highlight.highlightAuto(code).value;
    }
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

function parse(md, before, after) {
  let ret = {
    languages: [],
    html: ''
  };
  if (before) before();
  try {
    ret.html = marked(md, {
      highlight: function (code, language) {
        let languages;
        if (language) {
          languages = [language];
        }
        const result = highlight.highlightAuto(code, languages);
        ret.languages = Array.isArray(result.language) ? result.language : [result.language];
        return result.value;
      },
    });
    if (after) after();
  } catch (e) {
    if (after) after();
    throw e;
  }
  return ret;
}

function flowTitle(flow) {
  return flow.title || flow.filename;
}

function generateNav(flow = []) {
  const blocks = [];
  let index = flow.length - 1;
  blocks[index] = `<a>${flowTitle(flow[index])}</a>`;
  index--;
  if (index >= 0) {
    blocks[index] = `<a href="./summary.html">${flowTitle(flow[index])}</a>`;
    index--;
  }
  while(index >=0) {
    const rep = flow.length - 2 - index;
    blocks[index] = `<a href="${'../'.repeat(rep)}summary.html">${flowTitle(flow[index])}</a>`;
    index--;
  }
  return `${blocks.join('<span class="sep">></span>')}`;
}

async function writeHTML(filePath, content, options) {
  const { flow, type, languages } = options;
  const nav = generateNav(flow);
  const tplPath = path.join(tplDir, `${type}.ejs`);
  const html = await renderFile(tplPath, {
    content, nav, flow, languages
  });
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
  if (files.length) ensureFolder(catalog.outputPath);
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
          webPath: path.join(catalog.webPath, filename + '.html'),
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
          webPath: path.join(catalog.webPath, file),
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

function generateSummary(catalog, level = 0) {
  const summary = [];
  const link = catalog.webPath;
  const name = catalog.title || catalog.filename;
  const item = `${'  '.repeat(level)}- [${name}](${link})`;
  if (catalog.type === 'folder') {
    summary.push(item);
    for (const child of catalog.children) {
      summary.push(...generateSummary(child, level + 1));
    }
  } else if (catalog.type === 'file') {
    summary.push(item);
  }
  return summary;
}

async function generate(catalog) {
  if (catalog.type === 'folder') {
    await Promise.all(catalog.children.map(c => {
      return generate(c);
    }));
    const summary = generateSummary(catalog);
    const md = summary.join('\n');
    const { html, languages } = parse(md);
    await writeHTML(path.join(catalog.outputPath, 'summary.html'), html, {
      type: 'summary',
      languages,
      flow: [...catalog.flow, {
        title: 'Summary'
      }]
    });
  } else if (catalog.type === 'file') {
    const content = await readFile(catalog.realPath);
    const oldHeading = marked.Renderer.prototype.heading;
    const { html, languages } = parse(content.toString(), function () {
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
      type: 'article',
      languages,
      flow: catalog.flow
    });
  }
}

(async function() {
  const catalog = {
    type: 'folder',
    title: '博客',
    filename: '',
    webPath: '/',
    realPath: mdDir,
    outputPath: htmlDir,
    children: []
  };
  catalog.flow = [catalog];
  await travel(mdDir, catalog);
  await generate(catalog);
}()).catch(e => {
  console.trace(e);
});