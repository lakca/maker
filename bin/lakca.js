#!/usr/bin/env node
'use strict';

/* eslint no-unused-vars: off */

const program = require('commander');
const path = require('path');
const fs = require('fs');

program
  .version(
    JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
    ).version
  )
  .usage('[options]')
  .option(
    '-h, --host <host>',
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

program._name = 'lakca`s blog';

program.parse(process.argv);

// init command

const options = {};

if (program.host) options.host = program.host;
if (program.port) options.port = program.port;
if (program.backlog) options.backlog = program.backlog;

require('../server/serve')(options);
