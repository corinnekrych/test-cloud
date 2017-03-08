        var express = require('express');
        var bodyParser = require('body-parser');
        var cors = require('cors');
        var $fh = require("fh-mbaas-api");
        var constants = require('./constants.js');

        function chatITSupportRoute() {
            var chatITSupport = new express.Router();
              chatITSupport.use(cors());
              chatITSupport.use(bodyParser());
              chatITSupport.use(bodyParser.urlencoded());
              chatITSupport.use(bodyParser.json());

          function handleError(err, response) {
                    var error = {
                        "message": err,
                        "code": 500
                    };
                    response.writeHead(500);
                    response.end(JSON.stringify(error));
            }
        //GET REST endpoint - query params may or may not be populated
        chatITSupport.post('/', function(req, res) {
              
                var chatServiceId = req.param('chatServiceId');
                var chatQueueDetails = req.param('chatQueue');
                var chatQueueKey = req.param('chatQueueKey');
                var numberOfQueues;

                var options = {
                    "act": "read",
                    "type": constants.CHAT_IT_SUPPORT_TABLE,
                    "guid": chatServiceId
                };
                  $fh.db(options, function(err, entitiy) {
                  if(err) {
                    handleError(err, res);
                  } else {
                    var allFields = entitiy.fields;
                    numberOfQueues = parseInt(allFields.numberOfQueues, 10) + 1;
                    if('chatOptions' in allFields){
                        console.log("allFields>>>>>>>>>"+JSON.stringify(allFields));
                        if(chatQueueKey in allFields.chatOptions){
                            res.json({errorResponse:{errorCode: constants.CRT_CHAT_QUEUE_EXI_ERR, errorMessage: "Already you created the Queue with this name."}});
                        }else{
                            allFields.numberOfQueues = numberOfQueues;
                            allFields.chatOptions[chatQueueKey] = chatQueueDetails;
                        }
                    }else{
                      allFields['chatOptions']={};
                      allFields.numberOfQueues = numberOfQueues;
                      allFields.chatOptions[chatQueueKey] = chatQueueDetails;
                    }
                    var updateOption = {
                          "act": "update",
                          "type": constants.CHAT_IT_SUPPORT_TABLE,
                          "guid": chatServiceId,
                          "fields": allFields
                    };
                    $fh.db(updateOption, function (err, data) {
                      if (err) {
                        console.error("Error " + err);
                      } else {
                              res.json({successResponse:{successCode: constants.CREATE_CHAT_QUEUE_SUC, successMessage: "Chat Queue created successfully."}});
                      }
                     });
                  
              }
            });
          });
          return chatITSupport;
        }
  module.exports = chatITSupportRoute;