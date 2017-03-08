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
                var callQueueDetails = req.param('callQueue');
                var oldCallQueueKey = req.param('oldCallQueueKey');
                var newCallQueueKey = req.param('newCallQueueKey');
                
                var options = {
                    "act": "read",
                    "type": constants.CALL_IT_SUPPORT_TABLE,
                    "guid": callServiceId
                };
                  $fh.db(options, function(err, entitiy) {
                  if(err) {
                    handleError(err, res);
                  } else {
                    if (oldCallQueueKey in entitiy.fields.phoneNumbers) {
                      console.log("Phone number details>>>>>>>>>>>>"+JSON.stringify(entitiy));
                      var allFields = entitiy.fields;
                      allFields.phoneNumbers[newCallQueueKey] = allFields.phoneNumbers[oldCallQueueKey];
                      delete allFields.phoneNumbers[oldCallQueueKey];
                      allFields.phoneNumbers[newCallQueueKey] = callQueueDetails;
                      console.log("New Phone number details>>>>>>>>>>>>"+JSON.stringify(allFields));
                      var updateOption = {
                          "act": "update",
                          "type": constants.CALL_IT_SUPPORT_TABLE,
                          "guid": callServiceId,
                          "fields": allFields
                    };
                    $fh.db(updateOption, function (err, data) {
                      if (err) {
                        console.error("Error " + err);
                      } else {
                          res.json({successResponse:{successCode: constants.UPDATE_CALL_QUEUE_SUC, successMessage: "Call Queue updated successfully."}});
                      }
                     });
                    }
                    else {
                      res.json({errorResponse:{errorCode: constants.UPDATE_CALL_QUEUE_ERR, errorMessage: "Call Queue updated failed."}}); 
                }
              }
            });
          });
          return callITSupport;
        }
  module.exports = callITSupportRoute;