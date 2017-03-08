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
                var oldChatQueueKey = req.param('oldChatQueueKey');
                var newChatQueueKey = req.param('newChatQueueKey');

                var options = {
                    "act": "read",
                    "type": constants.CHAT_IT_SUPPORT_TABLE,
                    "guid": chatServiceId
                };
                  $fh.db(options, function(err, entitiy) {
                  if(err) {
                    handleError(err, res);
                  } else {
                    if (oldChatQueueKey in entitiy.fields.chatOptions) {
                      var allFields = entitiy.fields;
                      allFields.chatOptions[newChatQueueKey] = allFields.chatOptions[oldChatQueueKey];
                      delete allFields.chatOptions[oldChatQueueKey];
                      allFields.chatOptions[newChatQueueKey] = chatQueueDetails;
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
                          res.json({successResponse:{successCode: constants.UPDATE_CHAT_QUEUE_SUC, successMessage: "Chat Queue updated successfully."}});
                      }
                     });
                    }
                    else {
                    res.json({errorResponse:{errorCode: constants.UPDATE_CHAT_QUEUE_ERR, errorMessage: "Chat Queue updated failed."}}); 
                }
              }
            });
          });
          return chatITSupport;
        }
  module.exports = chatITSupportRoute;