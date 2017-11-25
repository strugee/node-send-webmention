# node-send-webmention

[![Build Status](https://travis-ci.org/strugee/node-send-webmention.svg?branch=master)](https://travis-ci.org/strugee/node-send-webmention)
[![Coverage Status](https://coveralls.io/repos/github/strugee/node-send-webmention/badge.svg?branch=master)](https://coveralls.io/github/strugee/node-send-webmention?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/strugee/node-send-webmention.svg)](https://greenkeeper.io/)

Send a Webmention.

Originally written for similar reasons as [`get-webmention-url`][] - [`webmention-client`][] was way overcomplicated and seemed unmaintained.

This project is, however, API-compatible with @connrs' module. The original was extremely sensible in that regard.

## Install

```
npm install send-webmention
```

## Usage

This module is a drop-in replacement for [`webmention-client`] with the following exceptions:

* It uses [`get-webmention-url`][] under the hood so it supports more discovery mechanisms (and has less bugs)
* It considers any 2xx response to mean success, not just 202 Accepted
* It returns the HTTP response object instead of trying to be clever with the body

The module exports a function with several forms:

### `webmention(source, target[, userAgent], callback)`

`source` (`String`): the source URL for the Webmention.

`target` (`String`): the target URL to send the Webmention to.

`userAgent` (`String`; optional): the value of the `User-Agent` header for all HTTP requests

`callback` (`Function`): function that will be called when the Webmention has been sent. See "callback return values" below

### `webmention(opts, callback)`

`opts` (`Object`): options object with at least a `target` key and a `source` key, plus an optional `ua` key to set the `User-Agent`

`callback` (`Function`): function that will be called when the Webmention has been sent. See "callback return values" below

### Callback return values

The callback function will receive either an error as the first argument or an object as the second argument (never both).

If everything goes (mostly) okay, you'll get the object back. The object will have one or two keys, `success` (which is a `Boolean`) and `res` (which is an instance of `http.IncomingMessage` and is included only if the target had a Webmention endpoint that we POSTed to). `success` will be `true` if the Webmention was successfully delivered and the response used a 2xx status code. Otherwise it will be `false`.

If an error is encountered during processing (this mostly means HTTP errors), you'll get back an `Error` instead. Note that a page not having a Webmention endpoint or a non-2xx response will _not_ result in an `Error`, but they _will_ result in `success` being set to `false`.

## Examples

```js
var webmention = require('send-webmention'),
    concat = require('concat-stream');

webmention('https://example.com/index.html', 'https://example.org/a_post', function(err, obj) {
    if (err) throw err;

    if (obj.success) {
        obj.res.pipe(function(buf) {
            console.log('Success! Got back response:', buf.toString());
        });
    } else {
        console.log('Failure :(');
    }
});
```

```js
var webmention = require('send-webmention'),
    concat = require('concat-stream');

webmention('https://example.com/index.html', 'https://example.org/a_post', 'webmention-5000/1.0.0', function(err, obj) {
    // Same thing
});
```

```js
var webmention = require('send-webmention'),
    concat = require('concat-stream');

webmention({
               source: 'https://example.com/index.html',
               target: 'https://example.org/a_post'
           },
           function(err, obj) {
               // Same thing
           });
```

```js
var webmention = require('send-webmention'),
    concat = require('concat-stream');

webmention({
               source: 'https://example.com/index.html',
               target: 'https://example.org/a_post',
               ua: 'webmention-5000/1.0.0'
           },
           function(err, obj) {
               // Same thing
           });
```

## Security considerations

This module does absolutely nothing to address the Webmention spec's [security considerations section][]. You need to take care of this yourself.

## Version support

Supports Node 4+.

## Author

AJ Jordan <alex@strugee.net>

## License

Lesser GPL 3.0+

 [`get-webmention-url`]: https://github.com/strugee/node-get-webmention-url
 [`webmention-client`]: https://github.com/connrs/node-webmention-client
 [security considerations section]: https://www.w3.org/TR/webmention/#security-considerations
