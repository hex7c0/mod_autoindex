'use strict';
/**
 * @file exclude example
 * @module mod_autoindex
 * @subpackage examples
 * @version 0.0.1
 * @author hex7c0 <hex7c0@gmail.com>
 * @license GPLv3
 */

/*
 * initialize module
 */
var index = require('..'); // use require('mod_autoindex') instead
var express = require('express');

var dir = __dirname + '/..';
var app = express();

var options = {};
options.exclude = /.js$/; // exclude javascript files
options.priority = false; // disable dir priority

// index
app.use(index(dir, options)).listen(3000);// server starting
console.log('starting "hello world" on port 3000');
