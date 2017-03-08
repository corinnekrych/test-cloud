        var express = require('express');
        var bodyParser = require('body-parser');
        var cors = require('cors');
        var $fh = require("fh-mbaas-api");
        var constants = require('./constants.js');

        function callITSupportRoute() {
            var callITSupport = new express.Router();
              callITSupport.use(cors());
              callITSupport.use(bodyParser());
              callITSupport.use(bodyParser.urlencoded());
              callITSupport.use(bodyParser.json());

          function handleError(err, response) {
                    var error = {
                        "message": err,
                        "code": 500
                    };
                    response.writeHead(500);
                    response.end(JSON.stringify(error));
            }
        //GET REST endpoint - query params may or may not be populated
        callITSupport.put('/', function(req, res) {
              
                var compId = req.param('companyId');
                var companyId = parseInt(compId, 10);
                var language = req.param('userSelectedLang');
                var numberOfQueues = req.param('numberOfQueues');
                var startTimeInUTC = req.param('startTimeInUTC');
                var endTimeInUTC = req.param('endTimeInUTC');
                var serviceDaysPerWeek = req.param('serviceDaysPerWeek');
                var phoneNumbers = req.param('phoneNumbers');

                var options = {
                    "act": "list",
                    "type": constants.CALL_IT_SUPPORT_TABLE,
                    "eq": {
                        "lang": language
                    },
                    "in": {
                           "companyId": [companyId, compId]
                          }
                };
                  $fh.db(options, function(err, callITSupportData) {
                  if(err) {
                    handleError(err, res);
                  } else {
                    if (callITSupportData.count >= 1) {
                      
                          res.json({errorResponse:{errorCode: 100013, errorMessage: "Call IT Support is already available for this language and company."}});
                    } else {
                      var createOption = {
                          "act": "create",
                          "type": constants.CALL_IT_SUPPORT_TABLE,
                          "fields": { 
                              "companyId": companyId,
                              "language": language,
                              "numberOfQueues": numberOfQueues,
                              "startTimeInUTC": startTimeInUTC,
                              "endTimeInUTC": endTimeInUTC,
                              "serviceDaysPerWeek": serviceDaysPerWeek,
                              "phoneNumbers": phoneNumbers
                          }
                      };
                    $fh.db(createOption, function (err, data) {
                      if (err) {
                        console.error("Error " + err);
                      } else {
                              res.json({errorResponse:{successCode: 100031, successMessage: "Call IT Support created successfully."}});
                      }
                  });
                }
              }
            });
          });
          return callITSupport;
        }
  module.exports = callITSupportRoute;