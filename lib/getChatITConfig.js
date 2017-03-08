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

                function handleError(err, response){
                    var error = {
                        "message": err,
                        "code": 500
                    };
                    response.writeHead(500);
                    response.end(JSON.stringify(error));
                }

                //GET REST endpoint - query params may or may not be populated
                chatITSupport.get('/', function(req, res) {

                var compId = req.param('companyId');
                var emailId = req.param('emailId');
                var companyId = parseInt(compId, 10);
                var language = req.param('userSelectedLang');
                var options = {
                    "act": "list",
                    "type": constants.CHAT_IT_SUPPORT_TABLE ,
                    "eq": {
                        "lang": language
                    },
                    "in": {
                        "companyId": [compId, companyId]
                    }
                };
                  $fh.db(options, function(err, chatITSupportData) {
                  if(err) {
                    handleError(err, res);
                  } else {
                    if (chatITSupportData.count == 1) {
                      var completeChatUrl;
                      var chatSupportOptions = [];
                      var responseObj = chatITSupportData.list[0].fields;
                      var availableChatOPtions = responseObj.chatOptions;
                      if (responseObj.chatBaseUrl) {
                        var basrUrl = responseObj.chatBaseUrl;
                        completeChatUrl = basrUrl + "aicAuthLogin=" + emailId + "&aicAuthAction=login&aicTenant=" + responseObj.tenantName + "&aicLanguage="
                        + responseObj.lang + "&aicEscAction=escalate&aicEscRequestedMedia=chat";
                        if(typeof availableChatOPtions!== "undefined"){
                          Object.keys(availableChatOPtions).forEach(function(key) {
                            var eachObject = availableChatOPtions[key];
                            eachObject["chatUrl"] = completeChatUrl + "&aicEscQuestion=" + eachObject.escQuestion + "&aicEscDisplayName=" + emailId;
                            chatSupportOptions.push(eachObject); 
                          });
                        }
                        res.json({chatITSupportDetails: {chatQueues: chatSupportOptions, startTimeInUTC: responseObj.startTimeInUTC, endTimeInUTC: responseObj.endTimeInUTC,
                        language: responseObj.lang, companyId: responseObj.companyId, serviceDaysPerWeek: responseObj.serviceDaysPerWeek, chatConfig: responseObj.chatConfig,
                        numberOfQueues: responseObj.numberOfQueues, chatServiceId: chatITSupportData.list[0].guid}});
                      } else {
                        res.json({errorResponse:{errorCode: constants.GET_CHAT_URL_MIS_ERR, errorMessage: "Chat primary url is missing. Contact admin."}});
                        }
                    } else {
                        res.json({errorResponse:{errorCode: constants.GET_CHAT_SUP_NOT_AVAL, errorMessage: "Chat IT Support is not available for this user type from your Organisation."}});
                      }
                    }
                  });
                });
              return chatITSupport;
            }
        module.exports = chatITSupportRoute;