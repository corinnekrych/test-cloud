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
                var authLevelKey = req.param('authLevelKey');
                var tenantName = req.param('tenantName');
                var startTimeInUTC = req.param('startTimeInUTC');
                var endTimeInUTC = req.param('endTimeInUTC');
                var serviceDaysPerWeek = req.param('serviceDaysPerWeek');
                var chatConfig = req.param('chatConfig');

                 var options = {
                    "act": "read",
                    "type": constants.CHAT_IT_SUPPORT_TABLE,
                    "guid": chatServiceId,
                };
                  $fh.db(options, function(err, chatITSupportData) {
                  if(err) {
                    handleError(err, res);
                  } else {
                    if (chatITSupportData.count == 1) {
                      var allFields = chatITSupportData.fields;
                      allFields.authLevelKey = authLevelKey;
                      allFields.tenantName = tenantName;
                      allFields.startTimeInUTC = startTimeInUTC;
                      allFields.endTimeInUTC = endTimeInUTC;
                      allFields.serviceDaysPerWeek = serviceDaysPerWeek;
                      allFields.chatConfig = chatConfig;
                      var createOption = {
                           "act": "update",
                          "guid": chatServiceId,
                          "type": constants.CHAT_IT_SUPPORT_TABLE,
                          "fields": allFields
                      };
                    $fh.db(createOption, function (err, data) {
                      if (err) {
                        console.error("Error " + err);
                      } else {
                              res.json({successResponse:{successCode: constants.UPDATE_CHAT_SER_SUC, successMessage: "Chat IT Support updated successfully."}});
                      }
                    });
                  } else {
                    res.json({errorResponse:{errorCode: constants.UPDATE_CHAT_SER_ERR, errorMessage: "Chat IT Support is not able to update."}});  
                }
              }
            });
          });
          return chatITSupport;
        }
  module.exports = chatITSupportRoute;