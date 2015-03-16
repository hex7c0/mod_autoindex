'use strict';
/**
 * @file sync test
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
var express = require('express');
var request = require('supertest');
var assert = require('assert');

/*
 * test module
 */
describe('sync', function() {

  var app, text;

  beforeEach(function(done) {

    app = express();
    done();
  });

  describe('found', function() {

    it('should return 200 callback mod_index', function(done) {

      app.use(index(__dirname, {
        json: true
      }));

      request(app).get('/').expect(200).end(function(err, res) {

        assert.equal(err, null);
        text = JSON.parse(res.text);
        assert.equal(typeof text, 'object');
        done();
      });
    });
    it('should return 200 sync mod_index', function(done) {

      app.use(index(__dirname, {
        sync: true,
        json: true
      }));

      request(app).get('/').expect(200).end(function(err, res) {

        assert.equal(err, null);
        assert.deepEqual(text, JSON.parse(res.text));
        done();
      });
    });
  });

  describe('not found', function() {

    it('should return 400 callback mod_index', function(done) {

      app.use(index(__dirname, {
        json: true
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

      request(app).get('/foo').expect(404).end(function(err, res) {

        assert.equal(err, null);
        assert.notDeepEqual(res.text, text);
        text = res.text;
        assert.equal(typeof text, 'string');
        done();
      });
    });
    it('should return 500 sync mod_index', function(done) {

      app.use(index(__dirname, {
        sync: true,
        json: true
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

      request(app).get('/foo').expect(500).end(function(err, res) {

        assert.equal(err, null);
        assert.equal(text, res.text);
        done();
      });
    });
  });
});
