'use strict';
/**
 * @file basic test
 * @module mod_autoindex
 * @package mod_autoindex
 * @subpackage test
 * @version 0.0.1
 * @author https://github.com/expressjs/serve-static &
 *         https://github.com/expressjs/serve-index
 * @license GPLv3
 */

/*
 * initialize module
 */
// import
try {
    var index = require('../index.min.js'); // use require('mod_autoindex')
    // instead
    var app = require('express')();
    var request = require('supertest');
} catch (MODULE_NOT_FOUND) {
    console.error(MODULE_NOT_FOUND);
    process.exit(1);
}

/*
 * test module
 */
describe('basic', function() {

    before(function(done) {

        app.use(index(__dirname + '/..'));
        app.use(function(err, req, res, next) {

            var code = 0;
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
            res.status(code).end();
            return;
        });
        done();
    });

    it('should serve static files', function(done) {

        request(app).get('/index.js').expect(200, done);
    });

    it('should support nesting', function(done) {

        request(app).get('/test/basic.js').expect(200, done);
    });

    it('should support multiple slahes', function(done) {

        request(app).get('//////examples').expect(200, done);
    });

    it('should set Content-Type', function(done) {

        request(app).get('/index.js').expect('Content-Type',
                'application/javascript').expect(200, done);
    });

    it('should not support urlencoded pathnames', function(done) {

        request(app).get('/foo%20bar').expect(404, done);
    });

    it('should not choke on auth-looking URL', function(done) {

        request(app).get('//todo@txt').expect(404, done);
    });

    it('should support index.html', function(done) {

        request(app).get('/test').expect('Content-Type', /html/).expect(200,
                done);
    });

    it('should not support if dir not exist', function(done) {

        request(app).get('/tests').expect(404, done);
    });

    it('should support ../', function(done) {

        request(app).get('/test/../index.js').expect(200, done);
    });

    it('should support HEAD', function(done) {

        request(app).head('/index.js').expect(200, '', done);
    });

    it('should support conditional requests', function(done) {

        request(app).get('/index.js').end(
                function(err, res) {

                    if (err)
                        throw err;
                    request(app).get('/index.js').set('If-None-Match',
                            res.headers.etag).expect(304, done);
                });
    });

    it('should ignore hidden files', function(done) {

        request(app).get('/.npmignore').expect(404, done);
    });

    it('should set max-age=0 by default', function(done) {

        request(app).get('/index.js').expect('cache-control',
                'public, max-age=0').expect(200, done);
    });

    it('should serve text/html without Accept header', function(done) {

        request(app).get('/')
                .expect('Content-Type', 'text/html; charset=utf-8').expect(200,
                        done);
    });

    it('should deny path will NULL byte', function(done) {

        request(app).get('/%00').expect(404, done);
    });

    it('should deny path outside root', function(done) {

        request(app).get('/../').expect(404, done);
    });

    it('should deny directory traversal attack', function(done) {

        request(app).get('/../../../../../../../../../../../')
                .expect(404, done);
    });

    it('should deny directory traversal attack', function(done) {

        request(app).get('/~/Workspace').expect(404, done);
    });

    it('should treat an ENAMETOOLONG as a 414', function(done) {

        var path = Array(11000).join('foobar');
        request(app).get('/' + path).expect(414, done);
    });
});
