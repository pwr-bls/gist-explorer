"use strict";
var https = require('https'),
    qs = require('qs');


module.exports = {

    getGists: function (request, response) {
        var reqOptions = {
                host: 'api.github.com',
                port: '443',
                path: '/gists?access_token=' + request.body.data.auth_token,
                method: 'GET',
                headers: {
                    "Accept": "application/vnd.github.v3.text+json",
                    "User-Agent": "GistExplorer"
                }
            },
            body = '', req;

        req = https.request(reqOptions, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                body += chunk;
                console.log(chunk);
            });
            res.on('end', function () {
                response.send({
                    status: "OK",
                    data: JSON.parse(body)
                });
            });
        });
        req.end();
        req.on('error', function (e) {
            response.send(e);
        });
    },
    getGistsPublic: function (request, response) {
        var reqOptions = {
                host: 'api.github.com',
                port: '443',
                path: '/gists/public?access_token=' + request.body.data.auth_token,
                method: 'GET',
                headers: {
                    "Accept": "application/vnd.github.v3.text+json",
                    "User-Agent": "GistExplorer"
                }
            },
            body = '', req;

        req = https.request(reqOptions, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                response.send({
                    status: "OK",
                    data: JSON.parse(body)
                });
            });
            req.end();
            req.on('error', function (e) {
                response.send(e);
            });
        });
    },
    getGistsStarred: function (request, response) {
        var reqOptions = {
                host: 'api.github.com',
                port: '443',
                path: '/gists/starred?access_token=' + request.body.data.auth_token,
                method: 'GET',
                headers: {
                    "Accept": "application/vnd.github.v3.text+json",
                    "User-Agent": "GistExplorer"
                }
            },
            body = '', req;

        req = https.request(reqOptions, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                response.send({
                    status: "OK",
                    data: JSON.parse(body)
                });
            });
        });
        req.end();
        req.on('error', function (e) {
            response.send(e);
        });
    }
}
