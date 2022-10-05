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

var getEndpoint = require('get-webmention-url'),
    formurlencoded = require('form-urlencoded'),
    url = require('url'),
    http = require('http'),
    https = require('https'),
    pkg = require('./package');

module.exports = function sendWebmention(source, target, ua, cb) {
	var finalSource, finalTarget, parsedTarget;
	if (typeof source === 'string' && typeof target === 'string' && typeof ua === 'function') {
		// source, target, cb
		finalSource = source;
		parsedTarget = url.parse(target);
		finalTarget = target;
		cb = ua;
		ua = undefined;
	} else if (typeof source === 'string' && typeof target === 'string' && typeof ua === 'string' && typeof cb === 'function') {
		// source, target, ua, cb
		finalSource = source;
		parsedTarget = url.parse(target);
		finalTarget = target;
	} else if (typeof source === 'object' && typeof target === 'function') {
		// opts, cb
		finalSource = source.source;
		parsedTarget = url.parse(source.target);
		finalTarget = source.target;
		ua = source.ua;
		cb = target;
	} else {
		// XXX better error message
		throw new TypeError('couldn\'t understand arguments!');
	}

	ua = ua || 'node.js/' + process.versions.node + ' send-webmention/' + pkg.version;

	getEndpoint({url: parsedTarget, ua: ua}, function(err, _endpoint) {
		if (err) {
			cb(err);
			return;
		}

		if (!_endpoint) {
			cb(undefined, {success: false});
			return;
		}

		var endpoint = url.parse(_endpoint);

		var client = endpoint.protocol === 'http:' ? http : /* istanbul ignore next */ https;

		endpoint.method = 'POST';
		endpoint.headers = {'user-agent': ua, 'content-type': 'application/x-www-form-urlencoded'};

		var req = client.request(endpoint, function(res) {
			cb(undefined, {
				success: !(res.statusCode < 200 || res.statusCode >= 300),
				res: res
			});
		});

		req.on('error', cb);

		req.end(formurlencoded({source: finalSource, target: finalTarget}));
	});
};
