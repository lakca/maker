const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const debug = require('debug')('lakca');
const getType = require('mime-types').contentType;
const promisify = require('util').promisify;
const access = promisify(fs.access);
const fstat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

const cache = new Map();
const htmlDir = path.join(__dirname, '../html');
const staticDir = path.join(__dirname, '../static');

async function step(handlers, req, res) {
  for (const h of handlers) {
    const end = await h(req, res);
    if (end) break;
  }
  if (!res.headersSent && !res.hasOwnProperty('statusCode')) {
    res.writeHead(404);
    res.write('Not Found');
  }
  res.end();
}

async function serve(req, res) {
  let file;
  let dir;
  const realPath = req.ctx.path;
  if (/^\/static/i.test(realPath)) {
    dir = path.join(staticDir, realPath.replace(/^\/static/i, ''));
  } else {
    dir = path.join(htmlDir, realPath);
  }
  debug('file path: %s', dir);
  if (req.ctx.config.cache && cache.has(dir)) {
    file = cache.get(dir);
  } else {
    try {
      await access(dir, fs.constants.R_OK);
      const stat = await fstat(dir);
      if (stat.isFile()) {
        const fileBuf = await readFile(dir);
        const type = getType(path.extname(dir));
        file = {
          size: stat.size,
          buffer: fileBuf,
          type: type,
          mtime: stat.mtime
        };
        if (req.ctx.config.cache) {
          cache.set(dir, file);
        }
      }
    } catch (e) {
      debug('html resolve error: %o', e);
    }
  }
  if (file) {
    res.setHeader('Content-Type', file.type);
    res.setHeader('Content-Length', file.size);
    res.setHeader('Last-Modified', file.mtime.toGMTString());
    res.setHeader('Cache-Control', `public,max-age=${3600}`);
    const ifm = req.headers['if-modified-since'];
    if (ifm === file.mtime.toGMTString()) {
      debug('304...');
      res.writeHead(304);
    } else {
      debug('send file...');
      res.writeHead(200);
      res.write(file.buffer.toString());
    }
    return true;
  }
}

module.exports = function (options) {
  http.createServer(function (req, res) {
    debug('request in');
    const { pathname } = url.parse(req.url);
    req.ctx = {
      path: pathname,
      get config() {
        return JSON.parse(JSON.stringify(options))
      }
    };
    step([serve], req, res).catch(e => {
      debug('request handler error: %o', e);
      if (!res.finished) {
        res.statusCode = 404;
        res.end();
      }
    });
  }).listen(options);
};
