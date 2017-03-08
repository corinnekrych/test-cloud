var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require("fh-mbaas-api");
var constants = require('./constants.js');
var request = require('request');

    function serviceAnyWhereRoute() {
      var serviceAnyWhere = new express.Router();
      serviceAnyWhere.use(cors());
      serviceAnyWhere.use(bodyParser());
      serviceAnyWhere.use(bodyParser.urlencoded());
      serviceAnyWhere.use(bodyParser.json());

        function handleError(err, response) {
            var error = {
                "message": err,
                "code": 500
            };
            response.writeHead(500);
            response.end(JSON.stringify(error));
        }
        //GET REST endpoint - query params may or may not be populated
        serviceAnyWhere.get('/', function(req, res) {

            console.log("req>>>>" + req.param.emailId + "req.body>>>>" + req.body.emailId + "query item", req.query.emailId);
            var emailId = req.param("emailId");
            var serviceURL = 'https://msast002pngx.saas.hp.com/rest/225013572/ems/Request?layout=Id,Status,DisplayLabel,Description&filter=Status=%27RequestStatusInProgress%27%20and%20RequestedForPerson.Email=%27'+emailId+'%27';
            console.log("serviceURL>>>>>>"+serviceURL);
            getOpenTickets(constants.COOKIE);
            console.log("constants.COOKIE>>>>>"+constants.COOKIE);
            function getOpenTickets(cookieId){
                var options = {
                    url: serviceURL,
                    headers: {
                        'cookie': 'LWSSO_COOKIE_KEY=' + cookieId
                    }
                };
                request(options, callback);
            }

            function callback(error, response, body) {

                if (!error && response.statusCode == 200) {
                    console.log("result has come"+body);
                    var response = [];
                    var responseObject;
                    var infoResponse = JSON.parse(body);
                    if(typeof infoResponse!== "undefined" && infoResponse != null){
                        if("entities" in infoResponse){
                            for(var index=0; index<infoResponse.entities.length; index++){
                                responseObject = JSON.parse(JSON.stringify(infoResponse.entities[index].properties).replace(/<p>/g, '').replace(/<\/p>/g, ''));
                                response.push(responseObject);
                            }
                        }
                    }

                    res.json({output: response});
                } else {
                console.log("error reslt has come");
                var loginOptions = {
                    url: 'https://msast002pngx.saas.hp.com/auth/authentication-endpoint/authenticate/login',
                    method: "POST",
                    json: {"Login":"ameet.kumar-mandal@hpe.com","Password":"Apple@123"}
                };
                request(loginOptions, function (error1, response1, body1) {

                    if (!error1 && response1.statusCode == 200) {
                        console.log("login result has come");
                        console.log("body>>"+body1);
                        constants.COOKIE = body1;
                        getOpenTickets(body1);
                        //res.json({output: body1});

                    } else {
                        console.log("login error reslt has come");
                        res.json({output: error1, resp: response1.statusCode});
                    }
                });
                //res.json({output: error, resp: response.statusCode});
            }
        }   
    });
    return serviceAnyWhere;
}
module.exports = serviceAnyWhereRoute;