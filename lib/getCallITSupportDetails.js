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
            callITSupport.get('/', function(req, res) {
              
                var compId = req.param('companyId');
                var companyId = parseInt(compId, 10);
                var language = req.param('userSelectedLang');
                var options = {
                    "act": "list",
                    "type": "IS_CallITSupport",
                    "eq": {
                        "lang": language
                    },
                    "in": {
                           "companyId": [companyId, compId]
                          }
                };
                  $fh.db(options, function(err, callITSupportData) {
                  if(err) {
                    console.log("Error >>>>>>>>>>>>>>");
                    handleError(err, res);
                  } else {
                    if (callITSupportData.count == 1) {
                      var responseObj = callITSupportData.list[0].fields;
                      var phoneNumbers =callITSupportData.list[0].fields.phoneNumbers;
                      console.log("Success >>>>>>>>>>>>>>"+phoneNumbers);
                      var supportPhoneNumbers = [];
                      if(typeof phoneNumbers!== "undefined"){
                        Object.keys(phoneNumbers).forEach(function(key) {
                          supportPhoneNumbers.push(phoneNumbers[key]);
                        });
                      }
                      console.log("Service id:",callITSupportData.list[0].fields.guid);
                      res.json({callITSupportDetails:{cbaAddress:responseObj.cbaAddress, companyId:responseObj.companyId,
                          endTimeInUTC:responseObj.endTimeInUTC, startTimeInUTC: responseObj.startTimeInUTC, serviceDaysPerWeek:responseObj.serviceDaysPerWeek,
                          forUserType: responseObj.forUserType, lang: responseObj.lang,
                          numberOfQueues:responseObj.numberOfQueues, phoneNumbers: supportPhoneNumbers, callConfig: callITSupportData.list[0].fields.config, callServiceId: callITSupportData.list[0].guid}});
                        } else {
                            res.json({errorResponse:{errorCode: constants.GET_CALL_SUP_NOT_AVAL, errorMessage: "Call IT Support is not available for this user type from your Organisation."}});
                        }
                    }
                  });
                });
              return callITSupport;
            }
      module.exports = callITSupportRoute;