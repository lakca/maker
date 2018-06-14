#!/usr/bin/env node
'use strict';

const execFileSync = require('child_process').execFileSync;
const execSync = require('child_process').execSync;
const program = require('commander');
const path = require('path');
const fs = require('fs');

program
  .version(
    JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
    ).version
  )
  .usage('[command] [options]');

program
  .command('start')
  .description('start a node server to serve files.')
  .usage('[options]')
  .option(
    '-H, --host <host>',
    'host to listen on.'
  )
  .option(
    '-p, --port <port>',
    'port to listen on.',
    80
  )
  .option(
    '-b, --backlog <backlog>',
    'the maximum length of the queue of pending connections.'
  )
  .option(
    '-c, --cache',
    'the maximum length of the queue of pending connections.'
  )
  .action(function(cmd) {
    const options = {};
    if (cmd.host) options.host = cmd.host;
    if (cmd.port) options.port = cmd.port;
    if (cmd.backlog) options.backlog = cmd.backlog;
    options.cache = !!cmd.cache;
    require('../server/serve')(options);
  });

program.command('build [target]')
  .usage('[target]')
  .description('run command [style|md|highlight|all] to build files.')
  .action(function(target) {
    if (target === 'style') {
      execSync(`node ${path.join(__dirname, '..', 'script', 'style.js')}`);
    } else if (target === 'md') {
      execSync(`node ${path.join(__dirname, '..', 'script', 'markdown')}`);
    } else if (target === 'note') {
      execFileSync(path.join(__dirname, '..', 'script', 'note.sh'));
    } else if (target === 'highlight') {
      execFileSync(path.join(__dirname, '..', 'script', 'highlight.sh'));
    } else if (target === 'all') {
      execFileSync(path.join(__dirname, '..', 'script', 'build.sh'));
    } else {
      console.log('Noting to do.');
    }
    console.log('done');
  });

program._name = 'lakca';

program.parse(process.argv);
