# [mod_autoindex](http://supergiovane.tk/#/mod_autoindex)

[![NPM version](https://badge.fury.io/js/mod_autoindex.svg)](http://badge.fury.io/js/mod_autoindex)
[![Build Status](https://travis-ci.org/hex7c0/mod_autoindex.svg?branch=master)](https://travis-ci.org/hex7c0/mod_autoindex)
[![devDependency Status](https://david-dm.org/hex7c0/mod_autoindex/dev-status.svg)](https://david-dm.org/hex7c0/mod_autoindex#info=devDependencies)

Generates directory indexes, automatically, similar to the Unix `ls` command or the Win32 `dir` shell command.
In combination with [serve-static](https://github.com/expressjs/serve-static).

Display index of given root directory, like https://code.angularjs.org/1.3.0-beta.17/ or `apache2 mod_autoindex`

## Installation

Install through NPM

```bash
npm install mod_autoindex
```
or
```bash
git clone git://github.com/hex7c0/mod_autoindex.git
```

## API

inside expressjs project
```js
var autoindex = require('mod_autoindex');
var app = require('express')();

app.use(autoindex(__dirname));
```

### index(root,[options])

#### root

 - `root` - **String** Index given root directory *(default "required")*

#### [options]

 - `exclude` - **RegExp** Regular expression for files/dirs exclude *(default "disabled")*
 - `dotfiles`- **Boolean** Flag for hide dotfiles *(default "enabled")*
 - `date` - **Boolean** Flag for display modification time *(default "enabled")*
 - `size` - **Boolean** Flag for display files size *(default "enabled")*
 - `priority` - **Boolean** Flag for display dirs before files *(default "enabled")*
 - `strictMethod` - **Boolean** Flag for check "HEAD" and "GET" HTTP methods *(default "disabled")*
 - `static` - **Object | false** Options for [serve-static](https://github.com/expressjs/serve-static) or disable support (if you use static server like nginx) *(default "null")*

## Examples

Take a look at my [examples](https://github.com/hex7c0/mod_autoindex/tree/master/examples)

### [License GPLv3](http://opensource.org/licenses/GPL-3.0)
