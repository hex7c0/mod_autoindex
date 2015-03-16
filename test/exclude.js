'use strict';
/**
 * @file exclude test
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

/*
 * test module
 */
describe(
  'exclude',
  function() {

    describe(
      'callback',
      function() {

        before(function(done) {

          app.use(index(__dirname, {
            exclude: /.js$/
          })).use(function(err, req, res, next) {

            var code;
            switch (err.message.toLowerCase()) {
              case 'forbidden':
                code = 403;
                break;
              case 'not found':
                code = 404;
                break;
              case 'request-uri too large':
                code = 414;
                break;
              default:
                code = 500;
                break;
            }
            res.status(code).send('error');
          });
          done();
        });

        it(
          'should return empty "__dirname" dir',
          function(done) {

            request(app)
            .get('/')
            .expect(200)
            .end(
              function(err, res) {

                if (/^<html>\n<head><title>Index of \/<\/title><\/head>\n<body bgcolor="white">\n<h1>Index of \/<\/h1><hr><pre>\n<\/pre><hr><\/body>\n<\/html>\n$/
                .test(res.text)) done();
              });
          });
        it('shouldn\'t return "simple.js" file', function(done) {

          request(app).get('/simple.js').expect(404).end(function(err, res) {

            assert.equal(err, null);
            assert.equal(res.text, 'error');
            done();
          });
        });
      });

    describe(
      'sync',
      function() {

        before(function(done) {

          app.use(index(__dirname, {
            exclude: /.js$/,
            sync: true
          })).use(function(err, req, res, next) {

            var code;
            switch (err.message.toLowerCase()) {
              case 'forbidden':
                code = 403;
                break;
              case 'not found':
                code = 404;
                break;
              case 'request-uri too large':
                code = 414;
                break;
              default:
                code = 500;
                break;
            }
            res.status(code).send('error');
          });
          done();
        });

        it(
          'should return empty "__dirname" dir',
          function(done) {

            request(app)
            .get('/')
            .expect(200)
            .end(
              function(err, res) {

                if (/^<html>\n<head><title>Index of \/<\/title><\/head>\n<body bgcolor="white">\n<h1>Index of \/<\/h1><hr><pre>\n<\/pre><hr><\/body>\n<\/html>\n$/
                .test(res.text)) done();
              });
          });
        it('shouldn\'t return "simple.js" file', function(done) {

          request(app).get('/simple.js').expect(404).end(function(err, res) {

            assert.equal(err, null);
            assert.equal(res.text, 'error');
            done();
          });
        });
      });
  });
