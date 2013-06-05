/*
Written by Henrik Joreteg.
Copyright © 2013 by &yet, LLC.
Released under the terms of the MIT License:

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var request = require('request'),
    fs = require('fs'),
    uglify = require('uglify-js');

var source = fs.readFileSync('simplewebrtc.js').toString();

request.get('http://signaling.simplewebrtc.com:8888/socket.io/socket.io.js', function (err, res, body) {
    if (!err && body && body.length) {
        fs.writeFile('latest.js', uglify.minify(source + body, {fromString: true}).code, function (err) {
            if (err) throw err;
        });
    }
});
