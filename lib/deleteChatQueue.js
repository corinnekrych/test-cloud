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
                var chatQueueKey = req.param('chatQueueKey');

                var options = {
                    "act": "read",
                    "type": constants.CHAT_IT_SUPPORT_TABLE,
                    "guid": chatServiceId
                };
                  $fh.db(options, function(err, entitiy) {
                  if(err) {
                    handleError(err, res);
                  } else {
                    if (chatQueueKey in entitiy.fields.chatOptions) {
                      var allFields = entitiy.fields;
                      allFields.numberOfQueues = allFields.numberOfQueues-1;
                      delete allFields.chatOptions[chatQueueKey];
                      var deteleOption = {
                          "act": "update",
                          "type": constants.CHAT_IT_SUPPORT_TABLE,
                          "guid": chatServiceId,
                          "fields": allFields
                    };
                    $fh.db(deteleOption, function (err, data) {
                      if (err) {
                        console.error("Error " + err);
                      } else {
                              res.json({successResponse:{successCode: constants.DELETE_CHAT_QUE_SUC, successMessage: "Chat Queue deteted successfully."}});
                      }
                     });
                    }
                    else {
                    res.json({errorResponse:{errorCode: constants.DELETE_CHAT_QUE_ERR, errorMessage: "Chat Queue deteted failed."}}); 
                }
              }
            });
          });
          return chatITSupport;
        }
  module.exports = chatITSupportRoute;