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
describe('strict',function() {

    before(function(done) {

        app.use(index(__dirname,{
            strictMethod: true
        }));
        done();
    });

    describe('200',function() {

        it('GET',function(done) {

            request(app).get('/').expect(200,done);
        });

        it('HEAD',function(done) {

            request(app).head('/').expect(200,done);
        });
    });

    describe('404',function() {

        it('POST',function(done) {

            request(app).post('/').expect(404,done);
        });

        it('PUT',function(done) {

            request(app).put('/').expect(404,done);
        });

        it('OPTIONS',function(done) {

            request(app).options('/').expect(404,done);
        });
    });
});
