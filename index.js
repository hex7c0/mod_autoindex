"use strict";
/**
 * @file mod_autoindex main
 * @module mod_autoindex
 * @package mod_autoindex
 * @subpackage main
 * @version 1.0.0
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
 * function wrapper for multiple require
 * 
 * @function wrapper
 * @param {Object} my - custom object parsed
 * @return {Object}
 */
function wrapper(root) {

    var header = '<html>\n<head><title>Index of {{path}}</title></head>\n<body bgcolor="white">\n<h1>Index of {{path}}</h1><hr><pre>\n';
    var footer = '</pre><hr></body>\n</html>\n';

    return function mod(req,res,next) {

        var head = header;
        var original = url(req.originalUrl || req.url).pathname;
        var prova = root + original;

        fs.stat(prova,function(err,stats) {

            if (err) {
                return next();
            }
            if (!stats.isDirectory()) {
                return next();
            }
            head = head.replace(/{{path}}/g,original);
            if (original != '/') {
                head += '<a href="../">../</a>\n';
            }
            fs.readdir(prova,function(err,files) {

                if (err) {
                    return next();
                }
                files.forEach(function(file) {

                    var ss = fs.statSync(prova + '/' + file);
                    var size;
                    if (ss.isDirectory()) {
                        size = '-';
                        head += '<a href="' + file + '/">' + file + '</a>';
                    } else {
                        size = String(ss.size);
                        head += '<a href="' + file + '">' + file + '</a>';
                    }
                    head += multiple(file.length,50);
                    head += new Date(ss.mtime).toUTCString();
                    head += multiple(size.length,20);
                    head += size + '\n';
                    return;
                });

                res.send(head + footer);
                return;
            });

            return;
        });
    };
}

/**
 * options setting
 * 
 * @exports index
 * @function index
 * @param {String} root - root path
 * @param {Object} options - various options. Check README.md
 * @return {Object}
 */
module.exports = function index(root,options) {

    if (!root) {
        throw new TypeError('root path required');
    }

    if (!fs.existsSync(root)) {
        throw new Error('path not exists');
    }
    if (!fs.lstatSync(root).isDirectory()) {
        throw new Error('path is not a directory');
    }
    if (root[root.length - 1] == '/') {
        var root = root.substr(0,root.length - 1);
    }

    return wrapper(root);
};
