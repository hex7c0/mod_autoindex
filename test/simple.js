'use strict';
/**
 * @file normal test
 * @module mod_autoindex
 * @subpackage test
 * @version 0.0.1
 * @author hex7c0 <hex7c0@gmail.com>
 * @license GPLv3
 */

/*
 * initialize module
 */
var index = require('..');
var app = require('express')();
var request = require('supertest');
var assert = require('assert');
var fs = require('fs');

/*
 * test module
 */
describe(
  'simple',
  function() {

    describe(
      'callback',
      function() {

        before(function(done) {

          app.use(index(__dirname));
          done();
        });

        it(
          'should return "__dirname" dir',
          function(done) {

            request(app)
            .get('/')
            .expect(200)
            .end(
              function(err, res) {

                if (!/^<html>\n<head><title>Index of \/<\/title><\/head>\n<body bgcolor="white">\n<h1>Index of \/<\/h1><hr><pre>\n/
                .test(res.text)) done('index only');
                if (!/<\/pre><hr><\/body>\n<\/html>\n$/.test(res.text)) done('body only');

                assert.equal(err, null);
                var a = res.text.match(/simple.js/g);
                assert(a.length, 2, 'this test file');
                done();
              });
          });
        it('should return "simple.js" file', function(done) {

          request(app).get('/simple.js').expect(200).end(function(err, res) {

            assert.equal(err, null);
            var file = fs.readFileSync(__dirname + '/simple.js', {
              encoding: 'utf8'
            });
            assert.equal(file, res.text);
            done();
          });
        });
      });

    describe(
      'sync',
      function() {

        before(function(done) {

          app.use(index(__dirname, {
            sync: true
          }));
          done();
        });

        it(
          'should return "__dirname" dir',
          function(done) {

            request(app)
            .get('/')
            .expect(200)
            .end(
              function(err, res) {

                if (!/^<html>\n<head><title>Index of \/<\/title><\/head>\n<body bgcolor="white">\n<h1>Index of \/<\/h1><hr><pre>\n/
                .test(res.text)) done('index only');
                if (!/<\/pre><hr><\/body>\n<\/html>\n$/.test(res.text)) done('body only');

                assert.equal(err, null);
                var a = res.text.match(/simple.js/g);
                assert(a.length, 2, 'this test file');
                done();
              });
          });
        it('should return "simple.js" file', function(done) {

          request(app).get('/simple.js').expect(200).end(function(err, res) {

            assert.equal(err, null);
            var file = fs.readFileSync(__dirname + '/simple.js', {
              encoding: 'utf8'
            });
            assert.equal(file, res.text);
            done();
          });
        });
      });
  });
