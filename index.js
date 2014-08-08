"use strict";
/**
 * @file mod_autoindex main
 * @module mod_autoindex
 * @package mod_autoindex
 * @subpackage main
 * @version 1.3.1
 * @author hex7c0 <hex7c0@gmail.com>
 * @copyright hex7c0 2014
 * @license GPLv3
 */

/*
 * initialize module
 */
// import
try {
    var fs = require('fs');
    var resolve = require('path').resolve;
    var url = require('url').parse;
    var serve = require('serve-static');
} catch (MODULE_NOT_FOUND) {
    console.error(MODULE_NOT_FOUND);
    process.exit(1);
}

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
function multiple(length,limit) {

    var space = '';
    if (limit < length) {
        return space;
    }
    for (var i = 0; i < limit - length; i++) {
        space += ' ';
    }
    return space;
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

    var header = '<html>\n<head><title>Index of {{path}}</title></head>\n<body bgcolor="white">\n<h1>Index of {{path}}</h1><hr><pre>\n';
    var footer = '</pre><hr></body>\n</html>\n';
    var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct',
            'Nov','Dec'];

    return function mod(req,res,next) {

        /**
         * next callback. (closure)
         * 
         * @function end
         */
        function end() {

            return my.static(req,res,next);
        }
        if (my.strictMethod && 'GET' != req.method && 'HEAD' != req.method) {
            return end();
        }
        var path = url(req.url);
        path = path.pathname || path.href;
        var prova = my.root + path;

        fs.stat(prova,function(err,stats) {

            if (err) {
                return end();
            }
            if (!stats.isDirectory()) {
                return end();
            }

            var head = header;
            head = head.replace(/{{path}}/g,path);
            if (path != '/') {
                head += '<a href="../">../</a>\n';
            }
            fs.readdir(prova,function(err,files) {

                if (err) {
                    return end();
                }

                var f = '';
                files.forEach(function(file) {

                    if (my.exclude && my.exclude.test(file)) {
                        return;
                    }
                    if (my.dotfiles && file[0] == '.') {
                        return;
                    }

                    var h;
                    var size;
                    var ss = fs.statSync(prova + '/' + file);
                    var d = new Date(ss.mtime);
                    if (ss.isDirectory()) {
                        size = '-';
                        file += '/';
                    } else {
                        size = String(ss.size);
                    }
                    h = '<a href="' + file + '">' + file + '</a>';
                    h += multiple(file.length,50);
                    if (my.date) {
                        h += pad(d.getDate()) + '-' + month[d.getMonth()] + '-'
                                + d.getFullYear();
                        h += ' ' + pad(d.getHours()) + ':'
                                + pad(d.getMinutes());
                        h += multiple(size.length,20);
                    }
                    if (my.size) {
                        h += size;
                    }
                    h += '\n';
                    if (my.priority) {
                        if (size == '-') {
                            head += h;
                        } else {
                            f += h;
                        }
                    } else {
                        head += h;
                    }
                    return;
                });

                head += f;
                res.send(head + footer);
                return;
            });

            return;
        });

        return;
    };
}

/**
 * options setting
 * 
 * @exports index
 * @function index
 * @param {String} root - root path
 * @param {Object} [options] - various options. Check README.md
 * @return {Object}
 */
module.exports = function index(root,options) {

    if (!root) {
        throw new TypeError('root path required');
    }
    if (!fs.existsSync(root)) {
        throw new Error('path not exists');
    }
    if (!fs.statSync(root).isDirectory()) {
        throw new Error('path is not a directory');
    }
    var r = resolve(root);
    if (root[root.length - 1] == '/') {
        r = root.substr(0,root.length - 1);
    }

    var options = options || Object.create(null);
    var my = {
        root: r,
        exclude: options.exclude || false,
        dotfiles: options.dotfiles == false ? false : true,
        date: options.date == false ? false : true,
        size: options.size == false ? false : true,
        priority: options.priority == false ? false : true,
        strictMethod: Boolean(options.strictMethod),
        static: options.static == false ? function() {

            return;
        } : serve(r,options.static)
    };
    return wrapper(my);
};
