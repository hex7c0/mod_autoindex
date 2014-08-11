"use strict";
/**
 * @file sync test
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
    var express = require('express');
    var request = require('supertest');
    var assert = require('assert');
} catch (MODULE_NOT_FOUND) {
    console.error(MODULE_NOT_FOUND);
    process.exit(1);
}

/*
 * test module
 */
describe('sync',function() {

    var text;
    it('callback',function(done) {

        var app = express();
        app.use(index(__dirname,{
            json: true
        }));
        request(app).get('/').expect(200).end(function(err,res) {

            text = JSON.parse(res.text);
            assert.deepEqual(typeof (text),'object','equal method');
            done();
            return;
        });
    });

    it('sync',function(done) {

        var app = express();
        app.use(index(__dirname,{
            sync: true,
            json: true
        }));
        request(app).get('/').expect(200).end(function(err,res) {

            assert.deepEqual(text,JSON.parse(res.text),'equal method');
            done();
            return;
        });
    });
});
