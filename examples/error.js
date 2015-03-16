'use strict';
/**
 * @file error example
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

// index
app.use(index(dir));

// error handler
app.use(function(err, req, res, next) {

  var code;
  var msg = err.message.toLowerCase();

  switch (msg) {
    case 'forbidden':
      code = 403;
      break;
    case 'not found':
      code = 404;
      break;
    case 'request-uri too large':
      code = 414;
      break;
    default:
      code = 500;
      break;
  }
  res.status(code).send(msg);
});

// server starting
app.listen(3000);
console.log('starting "hello world" on port 3000');