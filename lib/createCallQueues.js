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
                var callQueueKey = req.param('callQueueKey');
                var numberOfQueues;

                var options = {
                    "act": "read",
                    "type": constants.CALL_IT_SUPPORT_TABLE,
                    "guid": callServiceId
                };
                  $fh.db(options, function(err, entitiy) {
                  if(err) {
                    handleError(err, res);
                  } else {
                    var allFields = entitiy.fields;
                    numberOfQueues = parseInt(allFields.numberOfQueues, 10) + 1;
                    if('phoneNumbers' in allFields){
                        console.log("allFields>>>>>>>>>"+JSON.stringify(allFields));
                        if(callQueueKey in allFields.phoneNumbers){
                            res.json({errorResponse:{errorCode: constants.CRT_CALL_QUEUE_EXI_ERR, errorMessage: "Already you created the Queue with this name."}});
                        }else{
                            allFields.numberOfQueues = numberOfQueues;
                            allFields.phoneNumbers[callQueueKey] = callQueueDetails;
                        }
                    }else{
                      allFields['phoneNumbers']={};
                      allFields.numberOfQueues = numberOfQueues;
                      allFields.phoneNumbers[callQueueKey] = callQueueDetails;
                    }
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
                          res.json({successResponse:{successCode: constants.CREATE_CALL_QUEUE_SUC, successMessage: "Call Queue created successfully."}});
                      }
                     });
              }
            });
          });
          return callITSupport;
        }
  module.exports = callITSupportRoute;