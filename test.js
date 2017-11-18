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

var vows = require('perjury'),
    assert = vows.assert,
    http = require('http'),
    concat = require('concat-stream');

vows.describe('main module').addBatch({
	'When we set up a server': {
		topic: function() {
			var cb = this.callback;

			var server = http.createServer(function(req, res) {
				res.statusCode = 202;
				res.setHeader('Link', '</webmention>; rel="webmention"');

				if (req.url === '/webmention') {
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
				}
			}
		}
	}
}).export(module);
