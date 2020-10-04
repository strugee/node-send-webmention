/*
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

var vows = require('vows'),
    assert = vows.assert,
    http = require('http'),
    concat = require('concat-stream');

// XXX test status code behavior more explicitly

vows.describe('main module').addBatch({
	'When we set up a server': {
		topic: function() {
			var cb = this.callback;

			var server = http.createServer(function(req, res) {
				res.statusCode = 202;

				res.setHeader('X-Seen-UA', req.headers['user-agent']);

				if (req.url !== '/no_link_header') {
					res.setHeader('Link', '</webmention>; rel="webmention"');
				}

				if (req.url === '/webmention') {
					if (req.headers['content-type'] !== 'application/x-www-form-urlencoded') {
						res.statusCode = 400;
						res.end('Bad Content-Type');
						return;
					}

					req.pipe(concat(function (buf) {
						res.end(buf.toString());
					})).on('error', function(err) { throw err; });
				} else {
					res.end();
				}
			});

			server.listen(57891, function(err) {
				cb(err, server);
			});
		},
		teardown: function(server) {
			if (server && server.close) {
				server.close();
			}

			return true;
		},
		'it works': function(err) {
			assert.ifError(err);
		},
		'and we require the module': {
			topic: function() {
				return require('./index');
			},
			'it works': function(err) {
				assert.ifError(err);
			},
			'and we send a Webmention': {
				topic: function(webmention) {
					var cb = this.callback;

					webmention('http://example.com/post', 'http://localhost:57891', function(err, ret) {
						if (err) {
							cb(err);
							return;
						}

						ret.res.pipe(concat(function(buf) {
							cb(err, ret, buf.toString());
						}));
					});
				},
				'it works': function(err) {
					assert.ifError(err);
				},
				'it returns success': function(err, obj) {
					assert.isTrue(obj.success);
				},
				'it returns the response object': function(err, obj) {
					assert.isObject(obj.res);
				},
				'we sent the right data': function(err, obj, body) {
					assert.isTrue(body.includes('example.com'));
					assert.isTrue(body.includes('localhost'));
				},
				'we sent the default User-Agent': function(err, obj) {
					assert.isTrue(obj.res.headers['x-seen-ua'].includes('node.js/'));
					assert.isTrue(obj.res.headers['x-seen-ua'].includes('send-webmention/2'));
				}
			},
			'and we try sending a Webmention to a URL with no endpoint': {
				topic: function(webmention) {
					webmention('http://example.com/post', 'http://localhost:57891/no_link_header', this.callback);
				},
				'it works': function(err) {
					assert.ifError(err);
				},
				'it returns failure': function(err, obj) {
					assert.isFalse(obj.success);
				}
				// XXX no way to tell what User-Agent we send since we don't get the request object back
			},
			'and we try sending a Webmention to an unresponsive URL': {
				topic: function(webmention) {
					var cb = this.callback;

					webmention('http://example.com/post', 'http://localhost:1', function(err, ret) {
						if (ret) {
							cb(new Error('unexpected success'));
						} else {
							cb(undefined, err);
						}
					});
				},
				'we get the underlying HTTP error back': function(err, reterr) {
					assert.ifError(err);
					assert.isTrue(reterr instanceof Error);
					assert.equal(reterr.code, 'ECONNREFUSED');
				}
			},
			'and we give the module two URL strings and a callback': {
				topic: function(webmention) {
					webmention('http://example.com/post', 'http://localhost:57891', this.callback);
				},
				'it works': function(err) {
					assert.ifError(err);
				},
				'it returns success': function(err, obj) {
					assert.isTrue(obj.success);
				},
				'we sent the default User-Agent': function(err, obj) {
					assert.isTrue(obj.res.headers['x-seen-ua'].includes('node.js/'));
					assert.isTrue(obj.res.headers['x-seen-ua'].includes('send-webmention/2'));
				}
			},
			'and we give the module two URL strings, a User Agent string and a callback': {
				topic: function(webmention) {
					webmention('http://example.com/post', 'http://localhost:57891', 'foobar/1.0.0', this.callback);
				},
				'it works': function(err) {
					assert.ifError(err);
				},
				'it returns success': function(err, obj) {
					assert.isTrue(obj.success);
				},
				'we sent the right User-Agent': function(err, obj) {
					assert.equal(obj.res.headers['x-seen-ua'], 'foobar/1.0.0');
				}
			},
			'and we give the module an options object and a callback': {
				topic: function(webmention) {
					webmention({source: 'http://example.com/post',
					            target: 'http://localhost:57891'},
					           this.callback);
				},
				'it works': function(err) {
					assert.ifError(err);
				},
				'it returns success': function(err, obj) {
					assert.isTrue(obj.success);
				},
				'we sent the default User-Agent': function(err, obj) {
					assert.isTrue(obj.res.headers['x-seen-ua'].includes('node.js/'));
					assert.isTrue(obj.res.headers['x-seen-ua'].includes('send-webmention/2'));
				}
			},
			'and we give the module an options object with a UA string and a callback': {
				topic: function(webmention) {
					webmention({source: 'http://example.com/post',
					            target: 'http://localhost:57891',
					            ua: 'foobar/1.0.0'},
					           this.callback);
				},
				'it works': function(err) {
					assert.ifError(err);
				},
				'it returns success': function(err, obj) {
					assert.isTrue(obj.success);
				},
				'we sent the right User-Agent': function(err, obj) {
					assert.equal(obj.res.headers['x-seen-ua'], 'foobar/1.0.0');
				}
			},
			'and we give the module nonsensical arguments': {
				topic: function(webmention) {
					return webmention.bind(this, 'blah blah blah!', this.callback);
				},
				'it doesn\'t work': function(err, func) {
					assert.throws(func);
				}
			}
		}
	}
}).export(module);
