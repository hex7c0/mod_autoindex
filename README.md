# [mod_autoindex](https://github.com/hex7c0/mod_autoindex)
[![NPM version](https://badge.fury.io/js/mod_autoindex.svg)](http://badge.fury.io/js/mod_autoindex)
[![Build Status](https://travis-ci.org/hex7c0/mod_autoindex.svg?branch=master)](https://travis-ci.org/hex7c0/mod_autoindex)
[![devDependency Status](https://david-dm.org/hex7c0/mod_autoindex/dev-status.svg)](https://david-dm.org/hex7c0/mod_autoindex#info=devDependencies)

Generates directory indexes, automatically, similar to the Unix `ls` command or the Win32 `dir` shell command.
Use in combination with [serve-static](https://github.com/expressjs/serve-static) (middleware inside [express](https://github.com/strongloop/express) module).

Display index of given root directory, like https://code.angularjs.org/1.3.0-beta.17/ or `apache2 mod_autoindex`

## Installation

Install through NPM

```
npm install mod_autoindex
```
or
```
git clone git://github.com/hex7c0/mod_autoindex.git
```
or
```
http://supergiovane.tk/#/mod_autoindex
```

## API

inside expressjs project
```js
var index = require('mod_autoindex');
var express = require('express');
var app = express();
var DIR = __dirname + '/..';

// index
app.use(index(DIR));

// file download
app.use(express.static(DIR));
```

### index(root,[options])

 - `root` - **String** Index given root directory *(default "required")*
 - `options` - **Object** Customization
  - `exclude` - **RegExp** Regular expression for exclude files/dirs *(default "disabled")*
  - `date` - **Boolean** Flag for info modification time *(default "enabled")*
  - `size` - **Boolean** Flag for info files size *(default "enabled")*
  - `priority` - **Boolean** Flag for dirs priority *(default "enabled")*

#### Examples

Take a look at my [examples](https://github.com/hex7c0/mod_autoindex/tree/master/examples)

## License
Copyright (c) 2014 hex7c0

Licensed under the GPLv3 license.
