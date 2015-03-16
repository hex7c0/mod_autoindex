'use strict';
/**
 * @file options test
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
describe('strict', function() {

  var dir = __dirname + '/..'; // project dir
  var app, text;

  beforeEach(function(done) {

    app = express();
    done();
  });

  describe('callback', function(done) {

    it('should build standard output', function(done) {

      app.use(index(dir, {
        json: true
      }));
      request(app).get('/').expect(200).end(function(err, res) {

        assert.equal(err, null);
        text = JSON.parse(res.text);
        assert.equal(text['.gitignore'], undefined, 'hidden by default');
        assert.equal(typeof text['index.js'], 'object');
        assert.deepEqual(Object.keys(text['index.js']), [ 'mtime', 'size' ]);

        // cache
        request(app).get('/').expect(200).end(function(err, res) {

          assert.equal(err, null);
          text = JSON.parse(res.text);
          assert.equal(text['.gitignore'], undefined, 'hidden by default');
          assert.equal(typeof text['index.js'], 'object');
          assert.deepEqual(Object.keys(text['index.js']), [ 'mtime', 'size' ]);
          done();
        });
      });
    });
    it('should disable "priority" option', function(done) {

      app.use(index(dir, {
        json: true,
        priority: false
      }));
      request(app).get('/').expect(200).end(function(err, res) {

        assert.equal(err, null);
        assert.notDeepEqual(res.text, text);
        done();
      });
    });
    it('should disable "dotfiles" option', function(done) {

      app.use(index(dir, {
        json: true,
        dotfiles: false
      }));
      request(app).get('/').expect(200).end(function(err, res) {

        assert.equal(err, null);
        text = JSON.parse(res.text);
        assert.notEqual(text['.gitignore'], undefined, 'hidden by default');
        assert.equal(typeof text['index.js'], 'object');
        assert.deepEqual(Object.keys(text['index.js']), [ 'mtime', 'size' ]);
        done();
      });
    });
    it('should disable "date" option', function(done) {

      app.use(index(dir, {
        json: true,
        date: false
      }));
      request(app).get('/').expect(200).end(
        function(err, res) {

          assert.equal(err, null);
          text = JSON.parse(res.text);
          assert.equal(text['.gitignore'], undefined, 'hidden by default');
          assert.equal(typeof text['index.js'], 'object');
          assert.deepEqual(Object.keys(text['index.js']), [ 'size' ],
            'disable date');
          done();
        });
    });
    it('should disable "size" option', function(done) {

      app.use(index(dir, {
        json: true,
        size: false
      }));
      request(app).get('/').expect(200).end(
        function(err, res) {

          assert.equal(err, null);
          text = JSON.parse(res.text);
          assert.equal(text['.gitignore'], undefined, 'hidden by default');
          assert.equal(typeof text['index.js'], 'object');
          assert.deepEqual(Object.keys(text['index.js']), [ 'mtime' ],
            'disable size');
          done();
        });
    });
    it('should disable "cache" option', function(done) {

      app.use(index(dir, {
        json: true,
        cache: false
      }));
      request(app).get('/').expect(200).end(function(err, res) {

        assert.equal(err, null);
        text = JSON.parse(res.text);
        assert.equal(text['.gitignore'], undefined, 'hidden by default');
        assert.equal(typeof text['index.js'], 'object');
        assert.deepEqual(Object.keys(text['index.js']), [ 'mtime', 'size' ]);
        done();
      });
    });
  });

  describe('sync', function(done) {

    it('should build standard output', function(done) {

      app.use(index(dir, {
        json: true,
        sync: true
      }));
      request(app).get('/').expect(200).end(function(err, res) {

        assert.equal(err, null);
        text = JSON.parse(res.text);
        assert.equal(text['.gitignore'], undefined, 'hidden by default');
        assert.equal(typeof text['index.js'], 'object');
        assert.deepEqual(Object.keys(text['index.js']), [ 'mtime', 'size' ]);

        // cache
        request(app).get('/').expect(200).end(function(err, res) {

          assert.equal(err, null);
          text = JSON.parse(res.text);
          assert.equal(text['.gitignore'], undefined, 'hidden by default');
          assert.equal(typeof text['index.js'], 'object');
          assert.deepEqual(Object.keys(text['index.js']), [ 'mtime', 'size' ]);
          done();
        });
      });
    });
    it('should disable "priority" option', function(done) {

      app.use(index(dir, {
        json: true,
        sync: true,
        priority: false
      }));
      request(app).get('/').expect(200).end(function(err, res) {

        assert.equal(err, null);
        assert.notDeepEqual(res.text, text);
        done();
      });
    });
    it('should disable "dotfiles" option', function(done) {

      app.use(index(dir, {
        json: true,
        sync: true,
        dotfiles: false
      }));
      request(app).get('/').expect(200).end(function(err, res) {

        assert.equal(err, null);
        text = JSON.parse(res.text);
        assert.notEqual(text['.gitignore'], undefined, 'hidden by default');
        assert.equal(typeof text['index.js'], 'object');
        assert.deepEqual(Object.keys(text['index.js']), [ 'mtime', 'size' ]);
        done();
      });
    });
    it('should disable "date" option', function(done) {

      app.use(index(dir, {
        json: true,
        sync: true,
        date: false
      }));
      request(app).get('/').expect(200).end(
        function(err, res) {

          assert.equal(err, null);
          text = JSON.parse(res.text);
          assert.equal(text['.gitignore'], undefined, 'hidden by default');
          assert.equal(typeof text['index.js'], 'object');
          assert.deepEqual(Object.keys(text['index.js']), [ 'size' ],
            'disable date');
          done();
        });
    });
    it('should disable "size" option', function(done) {

      app.use(index(dir, {
        json: true,
        sync: true,
        size: false
      }));
      request(app).get('/').expect(200).end(
        function(err, res) {

          assert.equal(err, null);
          text = JSON.parse(res.text);
          assert.equal(text['.gitignore'], undefined, 'hidden by default');
          assert.equal(typeof text['index.js'], 'object');
          assert.deepEqual(Object.keys(text['index.js']), [ 'mtime' ],
            'disable size');
          done();
        });
    });
    it('should disable "cache" option', function(done) {

      app.use(index(dir, {
        json: true,
        sync: true,
        cache: false
      }));
      request(app).get('/').expect(200).end(function(err, res) {

        assert.equal(err, null);
        text = JSON.parse(res.text);
        assert.equal(text['.gitignore'], undefined, 'hidden by default');
        assert.equal(typeof text['index.js'], 'object');
        assert.deepEqual(Object.keys(text['index.js']), [ 'mtime', 'size' ]);
        done();
      });
    });
  });
});
