        var express = require('express');
        var bodyParser = require('body-parser');
        var cors = require('cors');
        var $fh = require("fh-mbaas-api");
        var constants = require('./constants.js');

            function callBackServiceRoute() {
              var callBackSupport = new express.Router();
              callBackSupport.use(cors());
              callBackSupport.use(bodyParser());
              callBackSupport.use(bodyParser.urlencoded());
              callBackSupport.use(bodyParser.json());

                function handleError(err, response) {
                    var error = {
                        "message": err,
                        "code": 500
                    };
                    response.writeHead(500);
                    response.end(JSON.stringify(error));
                }
                
            //GET REST endpoint - query params may or may not be populated
            callBackSupport.get('/', function(req, res) {
              
                var compId = req.param('companyId');
                var userType = req.param('userType');
                var companyId = parseInt(compId, 10);
                var options = {
                    "act": "list",
                    "type": "IS_CallBackSupport",
                    "eq": {
                        "companyId": companyId,
                        "forUserType": userType
                    }
                };
                  $fh.db(options, function(err, callITSupportData) {
                  if(err){
                    handleError(err, res);
                  } else {
                    if (callITSupportData.count == 1) {
                      var responseObj = callITSupportData.list[0].fields;
                      var phoneNumbers =callITSupportData.list[0].fields.serviceTypes;
                      var serviceTypes = [];
                      if (phoneNumbers.computerFreeze) {
                        
                        phoneNumbers.computerFreeze.phoneType = "CF";
                        serviceTypes.push(phoneNumbers.computerFreeze);
                      }
                      if (phoneNumbers.forgotPassword) {
                        phoneNumbers.forgotPassword.phoneType = "RP";
                        serviceTypes.push(phoneNumbers.forgotPassword);
                      }
                      if (phoneNumbers.networkConnectivity) {
                        phoneNumbers.networkConnectivity.phoneType = "NC";
                        serviceTypes.push(phoneNumbers.networkConnectivity);
                      }
                      if (phoneNumbers.otherIssues) {
                        
                          phoneNumbers.otherIssues.phoneType = "OI";
                          serviceTypes.push(phoneNumbers.otherIssues);
                      }
                      res.json({callITSupportDetails:{cbaAddress:responseObj.cbaAddress, companyId:responseObj.companyId,
                          endTimeInUTC:responseObj.endTimeInUTC, startTimeInUTC: responseObj.startTimeInUTC,
                          forUserType: responseObj.forUserType, lang: responseObj.lang,
                          numberOfQueues:responseObj.numberOfQueues, serviceDetails: serviceTypes}});
                        } else {
                            res.json({errorResponse:{errorCode: constants.GET_CB_NOT_AVAL_COMPANY, errorMessage: "Call back Support service is not available for this user type from your Organisation."}});
                        }
                    }
                  });
                });
              return callBackSupport;
            }
      module.exports = callBackServiceRoute;