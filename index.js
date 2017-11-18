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
    url = require('url'),
    http = require('http'),
    https = require('https'),
    pkg = require('./package');

module.exports = function sendWebmention(source, target, ua, cb) {
	var parsedSource, parsedTarget;
	if (typeof source === 'string' && typeof target === 'string' && typeof ua === 'function') {
		// source, target, cb
		parsedSource = url.parse(source);
		parsedTarget = url.parse(target);
		cb = ua;
		ua = undefined;
	} else if (typeof source === 'object' && typeof target === 'function') {
		// opts, cb
		parsedSource = url.parse(source.source);
		parsedTarget = url.parse(source.target);
		ua = source.ua;
		cb = target;
	} else if (typeof source === 'object' && typeof target === 'object' && typeof ua === 'function') {
		// url.parse(source), url.parse(target), cb
		parsedSource = source;
		parsedTarget = target;
		cb = ua;
		ua = undefined;
	} else if (typeof source === 'object' && typeof target === 'object' && typeof ua === 'string' && typeof cb === 'function') {
		// url.parse(source), url.parse(target), ua, cb
		parsedSource = source;
		parsedTarget = target;		
	} else {
		// XXX better error message
		throw new TypeError('couldn\'t understand arguments!');
		return;
	}

	var headers = {'user-agent': ua || 'node.js/' + process.versions.node + ' send-webmention/' + pkg.version};

	var client = target.protocol === 'http:' ? http : https;

	
}
