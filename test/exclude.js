"use strict";
/**
 * @file exclude test
 * @module mod_autoindex
 * @package mod_autoindex
 * @subpackage test
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
    var app = require('express')();
    var request = require('supertest');
} catch (MODULE_NOT_FOUND) {
    console.error(MODULE_NOT_FOUND);
    process.exit(1);
}

/*
 * test module
 */
describe(
        'exclude',
        function() {

            before(function(done) {

                app.use(index(__dirname,{
                    exclude: /.js$/
                }));
                done();
            });

            it(
                    'should return empty "__dirname" dir',
                    function(done) {

                        request(app)
                                .get('/')
                                .expect(200)
                                .end(
                                        function(err,res) {

                                            if (/^<html>\n<head><title>Index of \/<\/title><\/head>\n<body bgcolor="white">\n<h1>Index of \/<\/h1><hr><pre>\n<\/pre><hr><\/body>\n<\/html>\n$/
                                                    .test(res.text)) {
                                                done();
                                            }
                                            return;
                                        });
                    });
        });
