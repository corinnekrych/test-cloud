var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require("fh-mbaas-api");
var constants = require('./constants.js');
var request = require('request');
var querystring = require('querystring');

    function serviceNowRoute() {
      var serviceNow = new express.Router();
      serviceNow.use(cors());
      serviceNow.use(bodyParser());
      serviceNow.use(bodyParser.urlencoded());
      serviceNow.use(bodyParser.json());

        function handleError(err, response) {
            var error = {
                "message": err,
                "code": 500
            };
            response.writeHead(500);
            response.end(JSON.stringify(error));
        }
        //GET REST endpoint - query params may or may not be populated
        serviceNow.get('/', function(req, res) {

              
    });
    return serviceNow;
}
module.exports = serviceNowRoute;