"use strict";
var https = require('https'),
    qs = require('qs');


module.exports = {

    user: function (req, res) {
        var data = qs.stringify({});

        if(!req.body.data.auth_token) {
            res.send({
                status: "ERROR",
                "msg": "Forgot Authorization token"
            });
        }


        var reqOptions = {
            host: 'api.github.com',
            port: '443',
            path: '/user?access_token=' + req.body.data.auth_token,
            method: 'GET',
            headers: {
                "Accept": "application/vnd.github.v3.text+json",
                "User-Agent": "GistExplorer"
            }
        };

        var body = '';
        var _req = https.request(reqOptions, function (_res) {
            _res.setEncoding('utf8');
            _res.on('data', function (chunk) {
                body += chunk;
            });
            _res.on('end', function () {
                res.send({
                    status: "OK",
                    data: JSON.parse(body)
                });
            });
        });

        _req.write(data);
        _req.end();
        _req.on('error', function (e) {
            res.send(e);
        });
    }
}
