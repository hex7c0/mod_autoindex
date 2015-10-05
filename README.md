# [mod_autoindex](https://github.com/hex7c0/mod_autoindex)

[![NPM version](https://img.shields.io/npm/v/mod_autoindex.svg)](https://www.npmjs.com/package/mod_autoindex)
[![Linux Status](https://img.shields.io/travis/hex7c0/mod_autoindex.svg?label=linux)](https://travis-ci.org/hex7c0/mod_autoindex)
[![Windows Status](https://img.shields.io/appveyor/ci/hex7c0/mod_autoindex.svg?label=windows)](https://ci.appveyor.com/project/hex7c0/mod_autoindex)
[![Dependency Status](https://img.shields.io/david/hex7c0/mod_autoindex.svg)](https://david-dm.org/hex7c0/mod_autoindex)
[![Coveralls](https://img.shields.io/coveralls/hex7c0/mod_autoindex.svg)](https://coveralls.io/r/hex7c0/mod_autoindex)

Generates directory indexes, automatically, similar to the Unix `ls` command or the Win32 `dir` shell command; with memoization.
In combination with [serve-static](https://github.com/expressjs/serve-static).

Display index of given root directory, like https://code.angularjs.org/2.0.0-alpha.30/ or `apache2 mod_autoindex`

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

### autoindex(root [, options])

#### root

 - `root` - **String** Index given root directory *(default "required")*

#### [options]

 - `exclude` - **RegExp** Regular expression for files/dirs exclude *(default "disabled")*
 - `dotfiles`- **Boolean** Flag for hide dotfiles *(default "true")*
 - `date` - **Boolean** Flag for display modification time *(default "true")*
 - `size` - **Boolean** Flag for display files size *(default "true")*
 - `priority` - **Boolean** Flag for display dirs before files *(default "true")*
 - `cache` - **Boolean** Flag for using cache (depends from mtime dir) *(default "true")*
 - `strictMethod` - **Boolean** Flag for show "HEAD" and "GET" HTTP methods only *(default "false")*
 - `sync` - **Boolean** Flag for using "sync" methods instead of callback *(default "false")*
 - `json` - **Boolean** Flag for display json output instead of html *(default "false")*
 - `static` - **Object | false** Options for [serve-static](https://github.com/expressjs/serve-static) or disable support (if you use static server like nginx) *(default "{}")*

## Examples

Take a look at my [examples](examples)

### [License GPLv3](LICENSE)
