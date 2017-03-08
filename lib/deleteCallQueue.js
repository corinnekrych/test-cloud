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
        callITSupport.post('/', function(req, res) {
              
                var callServiceId = req.param('callServiceId');
                var callQueueKey = req.param('callQueueKey');
                
                var options = {
                    "act": "read",
                    "type": constants.CALL_IT_SUPPORT_TABLE,
                    "guid": callServiceId
                };
                  $fh.db(options, function(err, entitiy) {
                  if(err) {
                    handleError(err, res);
                  } else {
                    if (callQueueKey in entitiy.fields.phoneNumbers) {
                      var allFields = entitiy.fields;
                      allFields.numberOfQueues = allFields.numberOfQueues-1;
                      delete allFields.phoneNumbers[callQueueKey];
                      var deteleOption = {
                          "act": "update",
                          "type": constants.CALL_IT_SUPPORT_TABLE,
                          "guid": callServiceId,
                          "fields": allFields
                    };
                    $fh.db(deteleOption, function (err, data) {
                      if (err) {
                        console.error("Error " + err);
                      } else {
                              res.json({successResponse:{successCode: constants.DELETE_CALL_QUE_SUC, successMessage: "Call Queue deteted successfully."}});
                      }
                     });
                    }
                    else {
                    res.json({errorResponse:{errorCode: constants.DELETE_CALL_QUE_ERR, errorMessage: "Call Queue deteted failed."}}); 
                }
              }
            });
          });
          return callITSupport;
        }
  module.exports = callITSupportRoute;