"use strict";
/**
 * @file sync example
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

// index
app.use(index(DIR,{
    static: false,
    dotfiles: false,
    sync: true
}));

// server starting
app.listen(3000);
console.log('starting "hello world" on port 3000');
