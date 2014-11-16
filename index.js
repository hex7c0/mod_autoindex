'use strict';
/**
 * @file mod_autoindex main
 * @module mod_autoindex
 * @package mod_autoindex
 * @subpackage main
 * @version 1.4.0
 * @author hex7c0 <hex7c0@gmail.com>
 * @copyright hex7c0 2014
 * @license GPLv3
 */

/*
 * initialize module
 */
// import
try {
  var STATUS = require('http').STATUS_CODES;
  var PATH = require('path');
  var fs = require('fs');
  var normalize = PATH.normalize;
  var resolve = PATH.resolve;
  var join = PATH.join;
  var parse = require('parseurl');
  var serve = require('serve-static');
} catch (MODULE_NOT_FOUND) {
  console.error(MODULE_NOT_FOUND);
  process.exit(1);
}
// load
var header = '<html>\n<head><title>Index of {{path}}</title></head>\n<body bgcolor="white">\n<h1>Index of {{path}}</h1><hr><pre>\n';
var footer = '</pre><hr></body>\n</html>\n';
var month = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
    'Oct', 'Nov', 'Dec' ];

/*
 * functions
 */
/**
 * build multiple space
 * 
 * @function multiple
 * @param {Integer} length - string.length
 * @param {Integer} limit - max space
 * @return {String}
 */
function multiple(length, limit) {

  var space = '';
  if (limit < length) {
    return space;
  }
  for (var i = 0, ii = limit - length; i < ii; i++) {
    space += ' ';
  }
  return space;
}

/**
 * error handling
 * 
 * @function error
 * @param {Object|Number} e - error
 * @return {Error}
 */
function error(e) {

  if (isNaN(e) === true) {
    return new Error(STATUS[e]);
  }
  return new Error(e.code === 'ENAMETOOLONG' ? STATUS[414] : STATUS[404]);
}

/**
 * add zero
 * 
 * @function pad
 * @param {Integer} num - number
 * @return {String}
 */
function pad(num) {

  var norm = Math.abs(Math.floor(num));
  return (norm < 10 ? '0' : '') + norm;
}

/**
 * function wrapper for multiple require
 * 
 * @function wrapper
 * @param {Object} my - options
 * @return {Object}
 */
function wrapper(my) {

  /**
   * next callback
   * 
   * @function end
   * @param {Object} req - client request
   * @param {Object} res - response to client
   * @param {next} next - next callback
   */
  function end(req, res, next) {

    return my.static(req, res, next);
  }

  /**
   * next callback
   * 
   * @function output
   * @param {Object} res - response to client
   * @param {Object|String} head - header
   * @param {String} after - post header
   * @param {String} path - dir path
   * @param {Object} stat - path stat
   */
  function output(res, head, after, path, stat) {

    if (my.json) {
      res.send(head);
      STORY.body = head;
    } else {
      head += after + footer;
      res.send(head);
      STORY.body = head;
    }
    if (my.cache) {
      STORY.path = path;
      STORY.mtime = stat.mtime.getTime();
    }
    return;
  }

  /**
   * json builder
   * 
   * @function json
   * @param {Object} head - header
   * @param {String} after - post header
   * @param {String} file - file name
   * @param {Object} stats - stats of file
   * @return {Array}
   */
  function json(head, after, file, stats) {

    var size;
    var fil = file;
    if (stats.isDirectory()) {
      size = '-';
      fil += '/';
    } else {
      size = String(stats.size);
    }
    head[fil] = Object.create(null);
    if (my.date) {
      var d = new Date(stats.mtime);
      var h = pad(d.getDate()) + '-' + month[d.getMonth()] + '-'
          + d.getFullYear();
      h += ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
      head[fil].mtime = h;
    }
    if (my.size) {
      head[fil].size = size;
    }
    return [ head, null ];
  }

  /**
   * html builder
   * 
   * @function html
   * @param {String} head - header
   * @param {String} after - post header
   * @param {String} file - file name
   * @param {Object} stats - stats of file
   * @return {Array}
   */
  function html(head, after, file, stats) {

    var h;
    var size;
    var hea = head;
    var afte = after;
    var fil = file;
    if (stats.isDirectory()) {
      size = '-';
      fil += '/';
    } else {
      size = String(stats.size);
    }
    h = '<a href="' + fil + '">' + fil + '</a>';
    h += multiple(fil.length, 50);
    if (my.date) {
      var d = new Date(stats.mtime);
      h += pad(d.getDate()) + '-' + month[d.getMonth()] + '-' + d.getFullYear();
      h += ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
      h += multiple(size.length, 20);
    }
    if (my.size) {
      h += size;
    }
    h += '\n';
    if (my.priority) {
      if (size === '-') {
        hea += h;
      } else {
        afte += h;
      }
    } else {
      hea += h;
    }
    return [ hea, afte ];
  }

  var STORY = Object.create(null);
  var build = html;
  if (my.json) {
    build = json;
  }

  // start sync
  if (my.sync) {
    /**
     * body
     * 
     * @function mod_sync
     * @param {Object} req - client request
     * @param {Object} res - response to client
     * @param {next} next - next callback
     */
    return function mod_sync(req, res, next) {

      if (my.strictMethod && 'GET' != req.method && 'HEAD' != req.method) {
        return next(error(404));
      }
      var path = decodeURIComponent(parse(req).pathname).replace(/\/{2,}/, '/');
      var prova = normalize(join(my.root, path));
      if (~prova.indexOf('\0')) { // null byte(s), bad request
        return next(error(400));
      }
      if (prova <= my.root) { // /../
        return next(error(403));
      }
      var stat = fs.statSync(prova);
      if (stat) {
        if (STORY.mtime && STORY.mtime === stat.mtime.getTime()
            && STORY.path === prova) { // cache
          return res.send(STORY.body);
        }
        if (!stat.isDirectory()) {
          return end(req, res, next);
        }
        var head;
        if (my.json) {
          head = Object.create(null);
        } else {
          head = header;
          head = head.replace(/{{path}}/g, path);
          if (path != '/') {
            head += '<a href="../">../</a>\n';
          }
        }
        var files = fs.readdirSync(prova);
        if (files) {
          var after = '';
          for (var i = 0, ii = files.length; i < ii; i++) {

            var file = files[i];
            if (my.exclude && my.exclude.test(file)) {
              continue;
            }
            if (my.dotfiles && file[0] === '.') {
              continue;
            }
            var stats = fs.statSync(prova + PATH.sep + file);
            if (stats) {
              var r = build(head, after, file, stats);
              head = r[0];
              after = r[1];
            }
          }
          return output(res, head, after, prova, stat);

        }
      }
      return end(req, res, next);

    };
  }
  // end sync

  // start callback
  /**
   * body
   * 
   * @function mod_callback
   * @param {Object} req - client request
   * @param {Object} res - response to client
   * @param {next} next - next callback
   */
  return function mod_callback(req, res, next) {

    if (my.strictMethod && 'GET' != req.method && 'HEAD' != req.method) {
      return next(error(404));
    }
    var path = decodeURIComponent(parse(req).pathname).replace(/\/{2,}/, '/');
    var prova = normalize(join(my.root, path));
    if (~prova.indexOf('\0')) { // null byte(s), bad request
      return next(error(400));
    }
    if (prova <= my.root) { // /../
      return next(error(403));
    }
    fs.stat(prova, function(err, stat) {

      if (err) {
        return next(error(err));
      }
      if (STORY.mtime && STORY.mtime === stat.mtime.getTime()
          && STORY.path === prova) { // cache
        return res.send(STORY.body);
      }
      if (!stat.isDirectory()) {
        return end(req, res, next);
      }
      var head;
      if (my.json) {
        head = Object.create(null);
      } else {
        head = header;
        head = head.replace(/{{path}}/g, path);
        if (path != '/') {
          head += '<a href="../">../</a>\n';
        }
      }
      fs.readdir(prova, function(err, files) {

        if (err) {
          return next(error(err));
        }
        var after = '';
        var cc = files.length - 1;
        for (var i = 0, ii = files.length; i < ii; i++) {
          !function(file) {

            if (my.exclude && my.exclude.test(file)) {
              if (!cc) {
                return output(res, head, after, prova, stat);
              }
              cc--;
              return;
            }
            if (my.dotfiles && file[0] === '.') {
              if (!cc) {
                return output(res, head, after, prova, stat);
              }
              cc--;
              return;
            }
            fs.stat(prova + PATH.sep + file, function(err, stats) {

              if (err) {
                return next(error(err));
              }
              var r = build(head, after, file, stats);
              head = r[0];
              after = r[1];
              if (!cc) {
                return output(res, head, after, prova, stat);
              }
              cc--;
              return;
            });

            return;
          }(files[i]);
        }

        return;
      });

      return;
    });

    return;
  };
  // end callback

}

/**
 * options setting
 * 
 * @exports index
 * @function index
 * @param {String} root - root path
 * @param {Object} [opt] - various options. Check README.md
 * @return {Object}
 */
function index(root, opt) {

  if (!root) {
    throw new TypeError('root path required');
  }
  var r = resolve(root);
  if (r[r.length - 1] == '/') {
    r = r.substr(0, r.length - 1);
  }
  if (!fs.existsSync(root)) {
    throw new Error('path not exists');
  } else if (!fs.statSync(r).isDirectory()) {
    throw new Error('path is not a directory');
  }
  var options = opt || Object.create(null);
  var my = {
    root: r,
    exclude: options.exclude || false,
    dotfiles: options.dotfiles === false ? false : true,
    date: options.date === false ? false : true,
    size: options.size === false ? false : true,
    priority: options.priority === false ? false : true,
    cache: options.cache === false ? false : true,
    strictMethod: Boolean(options.strictMethod),
    sync: Boolean(options.sync),
    json: Boolean(options.json),
    static: options.static === false ? function end(req, res, next) {

      return next();
    } : serve(r, options.static)
  };
  return wrapper(my);
}
module.exports = index;
