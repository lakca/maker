const execSync = require('child_process').execSync;
const cssJson = require('./helper/css-json');
const path = require('path');
const fs = require('fs');
const staticDir = path.join(__dirname, '..', 'static');

function githubCSS() {
  // copy github markdown style.
  const githubStyle = fs.readFileSync(require.resolve('github-markdown-css')).toString();
  const githubStyleObj = cssJson.toJSON(githubStyle);
  // handle error handle of @font-face.url
  githubStyleObj.children['@font-face'].attributes.src = githubStyleObj.children['@font-face'][1];
  delete githubStyleObj.children['.markdown-body code'].attributes['background-color'];
  delete githubStyleObj.children['.markdown-body pre>code'].attributes['background'];
  delete githubStyleObj.children['.markdown-body pre code'].attributes['background-color'];
  delete githubStyleObj.children['.markdown-body pre code'].attributes['display'];
  githubStyleObj.children['.main-container'] = {
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
}

execSync(`stylus -c ${staticDir} -o ${staticDir}`);
githubCSS();
