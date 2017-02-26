'use strict';
/**
 * @file mod_autoindex main
 * @module mod_autoindex
 * @version 1.7.0
 * @author hex7c0 <hex7c0@gmail.com>
 * @copyright hex7c0 2014
 * @license GPLv3
 */

/*
 * initialize module
 */
var status = require('http').STATUS_CODES;
var path = require('path');
var fs = require('fs');
var parse = require('parseurl');
var serve = require('serve-static');
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
  for (var i = 0, ii = limit - length; i < ii; ++i) {
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

  if (isNaN(e) === false) {
    return new Error(status[e]);
  }
  return new Error(e.code === 'ENAMETOOLONG' ? status[414] : status[404]);
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
   * @function output
   * @param {Object} res - response to client
   * @param {Object|String} head - header
   * @param {String} after - post header
   * @param {String} paths - dir path
   * @param {Object} stat - path stat
   */
  function output(res, head, after, paths, stat) {

    if (my.json === true) {
      res.send(head);
      STORY.body = head;
    } else {
      head += after + footer;
      res.send(head);
      STORY.body = head;
    }
    if (my.cache === true) {
      STORY.path = paths;
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
    if (stats.isDirectory() === true) {
      size = '-';
      fil += '/';
    } else {
      size = String(stats.size);
    }
    head[fil] = Object.create(null);
    if (my.date === true) {
      var d = new Date(stats.mtime);
      var h = pad(d.getDate()) + '-' + month[d.getMonth()] + '-'
        + d.getFullYear();
      h += ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
      head[fil].mtime = h;
    }
    if (my.size === true) {
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
    if (stats.isDirectory() === true) {
      size = '-';
      fil += '/';
    } else {
      size = String(stats.size);
    }
    h = '<a href="' + fil + '">' + fil + '</a>';
    h += multiple(fil.length, 50);
    if (my.date === true) {
      var d = new Date(stats.mtime);
      h += pad(d.getDate()) + '-' + month[d.getMonth()] + '-' + d.getFullYear();
      h += ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
      h += multiple(size.length, 20);
    }
    if (my.size === true) {
      h += size;
    }
    h += '\n';
    if (my.priority === true) {
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
  if (my.json === true) {
    build = json;
  }

  // start sync
  if (my.sync === true) {
    /**
     * body
     * 
     * @function mod_sync
     * @param {Object} req - client request
     * @param {Object} res - response to client
     * @param {next} next - next callback
     */
    return function mod_sync(req, res, next) {

      if (my.strictMethod === true && 'GET' !== req.method
        && 'HEAD' !== req.method) {
        return next(error(404));
      }
      var paths = decodeURIComponent(parse(req).pathname)
          .replace(/\/{2,}/, '/');
      var prova = path.normalize(path.join(my.root, paths));
      if (~prova.indexOf('\0')) { // null byte(s), bad request
        return next(error(400));
      } else if (prova <= my.root) { // /../
        return next(error(403));
      }

      var stat = fs.statSync(prova);
      if (stat) {
        if (STORY.mtime && STORY.mtime === stat.mtime.getTime()
          && STORY.path === prova) { // cache
          return res.send(STORY.body);
        }
        if (stat.isDirectory() === false) {
          if (my.exclude !== false && my.exclude.test(prova)) {
            return next(error(404));
          }
          return my.statico(req, res, next);
        }
        var head;
        if (my.json === true) {
          head = Object.create(null);
        } else {
          head = header;
          head = head.replace(/{{path}}/g, paths);
          if (paths != '/') {
            head += '<a href="../">../</a>\n';
          }
        }
        var files = fs.readdirSync(prova);
        if (files) {
          var after = '';
          for (var i = 0, ii = files.length; i < ii; ++i) {

            var file = files[i];
            if (my.exclude !== false && my.exclude.test(file)) {
              continue;
            }
            if (my.dotfiles === true && file[0] === '.') {
              continue;
            }
            var stats = fs.statSync(prova + path.sep + file);
            if (stats) {
              var r = build(head, after, file, stats);
              head = r[0];
              after = r[1];
            }
          }
          return output(res, head, after, prova, stat);

        }
      }
      return my.statico(req, res, next);

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

    if (my.strictMethod === true && 'GET' !== req.method
      && 'HEAD' !== req.method) {
      return next(error(404));
    }
    var paths = decodeURIComponent(parse(req).pathname).replace(/\/{2,}/, '/');
    var prova = path.normalize(path.join(my.root, paths));
    if (~prova.indexOf('\0')) { // null byte(s), bad request
      return next(error(400));
    } else if (prova <= my.root) { // /../
      return next(error(403));
    }

    return fs.stat(prova, function(err, stat) {

      if (err) {
        return next(error(err));
      }
      if (STORY.mtime && STORY.mtime === stat.mtime.getTime()
        && STORY.path === prova) { // cache
        return res.send(STORY.body);
      }
      if (stat.isDirectory() === false) {
        if (my.exclude !== false && my.exclude.test(prova)) {
          return next(error(404));
        }
        return my.statico(req, res, next);
      }
      var head;
      if (my.json === true) {
        head = Object.create(null);
      } else {
        head = header;
        head = head.replace(/{{path}}/g, paths);
        if (paths != '/') {
          head += '<a href="../">../</a>\n';
        }
      }

      return fs.readdir(prova, function(err, files) {

        if (err) {
          return next(error(err));
        }

        var after = '';
        var cc = files.length - 1;
        for (var i = 0, ii = files.length; i < ii; ++i) {
          !function(file) {

            if (my.exclude !== false && my.exclude.test(file)) {
              if (cc === 0) {
                return output(res, head, after, prova, stat);
              }
              --cc;
              return;
            } else if (my.dotfiles === true && file[0] === '.') {
              if (cc === 0) {
                return output(res, head, after, prova, stat);
              }
              --cc;
              return;
            }

            return fs.stat(prova + path.sep + file, function(err, stats) {

              if (err) {
                return next(error(err));
              }
              var r = build(head, after, file, stats);
              head = r[0];
              after = r[1];
              if (cc === 0) {
                return output(res, head, after, prova, stat);
              }
              --cc;
              return;
            });
          }(files[i]);
        }

        return;
      });
    });
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
  var r = path.resolve(root);
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
    static: options.static === false ? false : options.static || {}
  };

  if (my.dotfiles === false && options.static !== false) {
    my.static.dotfiles = 'allow';
  }
  my.statico = my.static === false ? function(req, res, next) {

    return next();
  } : serve(r, my.static);

  return wrapper(my);
}
module.exports = index;
