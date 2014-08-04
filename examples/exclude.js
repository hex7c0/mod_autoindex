"use strict";
/**
 * @file exclude example
 * @module mod_autoindex
 * @package mod_autoindex
 * @subpackage examples
 * @version 0.0.1
 * @author hex7c0 <hex7c0@gmail.com>
 * @license GPLv3
 */

/*
 * initialize module
 */
// import
try {
    var index = require('../index.min.js'); // use require('mod_autoindex') instead
    var express = require('express');
} catch (MODULE_NOT_FOUND) {
    console.error(MODULE_NOT_FOUND);
    process.exit(1);
}

var DIR = __dirname + '/..';
var app = express();

var options = {};
options.exclude = /.js$/; // exclude javascript files
options.priority = false; // disable dir priority

// index
app.use(index(DIR,options));

// download file
app.use(express.static(DIR));

// server starting
app.listen(3000);
console.log('starting "hello world" on port 3000');