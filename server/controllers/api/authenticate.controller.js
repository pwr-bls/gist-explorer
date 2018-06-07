"use strict";
var https = require('https'),
    qs = require('qs');

module.exports = {
    authenticate: function (request, response) {
        var data = qs.stringify({
            client_id: "087af4bba38f9f50828c", //your GitHub client_id
            client_secret: "76a54dd6cf5593f3f1f03f5f14ae4f6d62bbe794",  //and secret
            code: request.body.data.code   //the access code we parsed earlier
        });

        var reqOptions = {
            host: 'github.com',
            port: '443',
            path: '/login/oauth/access_token',
            method: 'POST',
            headers: {'content-length': data.length}
        };

        var body = '';
        var req = https.request(reqOptions, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                response.send({
                    status: "OK",
                    data:qs.parse(body).access_token
                });
            });
        });

        req.write(data);
        req.end();
        req.on('error', function (e) {
            response.send(e);
        });


    }
}
