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
             
                var compId = req.param('companyId');
                var companyId = parseInt(compId, 10);
                var numberOfQueues = req.param('numberOfQueues');
                var chatBaseUrl = req.param('chatBaseUrl');
                var authLevelKey = req.param('authLevelKey');
                var tenantName = req.param('tenantName');
                var language = req.param('userSelectedLang');
                var startTimeInUTC = req.param('startTimeInUTC');
                var endTimeInUTC = req.param('endTimeInUTC');
                var serviceDaysPerWeek = req.param('serviceDaysPerWeek');
                var chatOptions = req.param('chatOptions');
                var chatConfig = req.param('chatConfig');

                var options = {
                    "act": "list",
                    "type": constants.CHAT_IT_SUPPORT_TABLE,
                    "eq": {
                        "lang": language
                    },
                    "in": {
                           "companyId": [companyId, compId]
                          }
                };
                  $fh.db(options, function(err, chatITSupportData) {
                  if(err) {
                    handleError(err, res);
                  } else {
                    if (chatITSupportData.count >= 1) {
                          res.json({errorResponse:{errorCode: constants.CREATE_CHAT_SER_AVAL_ERR, errorMessage: "Chat IT Support is already available for this language and company."}});
                    } else {
                      var createOption = {
                          "act": "create",
                          "type": constants.CHAT_IT_SUPPORT_TABLE,
                          "fields": { 
                              "companyId": companyId,
                              "numberOfQueues": numberOfQueues,
                              "chatBaseUrl": chatBaseUrl,
                              "authLevelKey": authLevelKey,
                              "tenantName": tenantName,
                              "lang": language,
                              "startTimeInUTC": startTimeInUTC,
                              "endTimeInUTC": endTimeInUTC,
                              "serviceDaysPerWeek": serviceDaysPerWeek,
                              "chatOptions": chatOptions,
                              "chatConfig": chatConfig
                          }
                      };
                    $fh.db(createOption, function (err, data) {
                      if (err) {
                        console.error("Error " + err);
                      } else {
                              res.json({successResponse:{successCode: constants.CREATE_CHAT_SER_SUC, successMessage: "Chat IT Support created successfully."}});
                      }
                  });
                }
              }
            });
          });
          return chatITSupport;
        }
  module.exports = chatITSupportRoute;