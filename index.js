"use strict";
/**
 * @file mod_autoindex main
 * @module mod_autoindex
 * @package mod_autoindex
 * @subpackage main
 * @version 1.3.2
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
    var parse = require('parseurl');
    var serve = require('serve-static');
} catch (MODULE_NOT_FOUND) {
    console.error(MODULE_NOT_FOUND);
    process.exit(1);
}
// load
var header = '<html>\n<head><title>Index of {{path}}</title></head>\n<body bgcolor="white">\n<h1>Index of {{path}}</h1><hr><pre>\n';
var footer = '</pre><hr></body>\n</html>\n';
var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov',
        'Dec'];

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

    /**
     * next callback
     * 
     * @function end
     * @param {Object} req - client request
     * @param {Object} res - response to client
     * @param {next} next - next callback
     */
    function end(req,res,next) {

        return my.static(req,res,next);
    }

    /**
     * json builder
     * 
     * @function json
     * @param {Object} head - header
     * @param {String} file - file name
     * @param {Object} stats - stats of file
     * @return {Object}
     */
    function json(head,file,stats) {

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
            head[fil].date = h;
        }
        if (my.size) {
            head[fil].size = size;
        }
        return head;
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
    function html(head,after,file,stats) {

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
        h += multiple(fil.length,50);
        if (my.date) {
            var d = new Date(stats.mtime);
            h += pad(d.getDate()) + '-' + month[d.getMonth()] + '-'
                    + d.getFullYear();
            h += ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
            h += multiple(size.length,20);
        }
        if (my.size) {
            h += size;
        }
        h += '\n';
        if (my.priority) {
            if (size == '-') {
                hea += h;
            } else {
                afte += h;
            }
        } else {
            hea += h;
        }
        return [hea,afte];
    }

    if (my.sync) {

        /**
         * body
         * 
         * @function mod
         * @param {Object} req - client request
         * @param {Object} res - response to client
         * @param {next} next - next callback
         */
        return function mod(req,res,next) {

            if (my.strictMethod && 'GET' != req.method && 'HEAD' != req.method) {
                return end(req,res,next);
            }
            var path = parse(req).pathname;
            var prova = my.root + path;

            var stats = fs.statSync(prova);
            if (stats) {
                if (!stats.isDirectory()) {
                    return end(req,res,next);
                }

                var head;
                if (my.json) {
                    head = Object.create(null);
                } else {
                    head = header;
                    head = head.replace(/{{path}}/g,path);
                    if (path != '/') {
                        head += '<a href="../">../</a>\n';
                    }
                }
                var files = fs.readdirSync(prova);
                if (files) {

                    var after = '';
                    files.forEach(function(file) {

                        if (my.exclude && my.exclude.test(file)) {
                            return;
                        }
                        if (my.dotfiles && file[0] == '.') {
                            return;
                        }

                        var stats = fs.statSync(prova + '/' + file);
                        if (stats) {
                            if (my.json) {
                                head = json(head,file,stats);
                            } else {
                                var r = html(head,after,file,stats);
                                head = r[0];
                                after = r[1];
                            }
                        }
                        return;
                    });

                    if (my.json) {
                        return res.send(head);
                    }
                    head += after;
                    return res.send(head + footer);
                }
            }
            return end(req,res,next);

        };

    }

    /**
     * body
     * 
     * @function mod
     * @param {Object} req - client request
     * @param {Object} res - response to client
     * @param {next} next - next callback
     */
    return function mod(req,res,next) {

        if (my.strictMethod && 'GET' != req.method && 'HEAD' != req.method) {
            return end(req,res,next);
        }
        var path = parse(req).pathname;
        var prova = my.root + path;

        fs.stat(prova,function(err,stats) {

            if (err) {
                return end(req,res,next);
            }
            if (!stats.isDirectory()) {
                return end(req,res,next);
            }

            var head;
            if (my.json) {
                head = Object.create(null);
            } else {
                head = header;
                head = head.replace(/{{path}}/g,path);
                if (path != '/') {
                    head += '<a href="../">../</a>\n';
                }
            }
            fs.readdir(prova,function(err,files) {

                if (err) {
                    return end(req,res,next);
                }

                var after = '';
                var cc = files.length;
                files.forEach(function(file) {

                    if (my.exclude && my.exclude.test(file)) {
                        if (cc-- == 1) {
                            if (my.json) {
                                return res.send(head);
                            }
                            head += after;
                            return res.send(head + footer);
                        }
                        return;
                    }
                    if (my.dotfiles && file[0] == '.') {
                        if (cc-- == 1) {
                            if (my.json) {
                                return res.send(head);
                            }
                            head += after;
                            return res.send(head + footer);
                        }
                        return;
                    }

                    fs.stat(prova + '/' + file,function(err,stats) {

                        if (err) {
                            return end(req,res,next);
                        }

                        if (my.json) {
                            head = json(head,file,stats);
                        } else {
                            var r = html(head,after,file,stats);
                            head = r[0];
                            after = r[1];
                        }

                        if (cc-- == 1) {
                            if (my.json) {
                                return res.send(head);
                            }
                            head += after;
                            return res.send(head + footer);
                        }
                        return;
                    });

                    return;
                });

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
        sync: Boolean(options.sync),
        json: Boolean(options.json),
        static: options.static == false ? function end(req,res,next) {

            return next();
        } : serve(r,options.static)
    };
    return wrapper(my);
};
