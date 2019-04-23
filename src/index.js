#! /usr/bin/env node

const program = require('commander');
const mailer = require('./mailer');
const pkg = require('../package.json');
require('dotenv').config();

program
    .usage('[date] [options]')
    .version(pkg.version, '-v, --version')
    .description(pkg.description)
    .arguments('[date]')
    .option('-w, --weekly', '以周报发送')
    .action((date) => {
        mailer(date, program.weekly);
    })
    .parse(process.argv);
