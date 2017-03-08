        var express = require('express');
        var bodyParser = require('body-parser');
        var cors = require('cors');
        var $fh = require("fh-mbaas-api");
        var constants = require('./constants.js');

        function setSkypeAddressRoute() {
            var setSkypeAddress = new express.Router();
              setSkypeAddress.use(cors());
              setSkypeAddress.use(bodyParser());
              setSkypeAddress.use(bodyParser.urlencoded());
              setSkypeAddress.use(bodyParser.json());

          function handleError(err, response) {
                    var error = {
                        "message": err,
                        "code": 500
                    };
                    response.writeHead(500);
                    response.end(JSON.stringify(error));
            }
        //GET REST endpoint - query params may or may not be populated
        setSkypeAddress.post('/', function(req, res) {
             console.log("req>>>",req);
                var companyId = req.param('companyId');
                var compId =  parseInt(companyId, 10);
                var requestName = req. param('requestName');
                var path, optionName, subScript, serviceType, serviceURL, clientId, clientSecret, userName, password, newObj ,companyDetails, tenantId;

                if(requestName == "tickets") {

                    serviceType = req.param('serviceType');
                    serviceURL = req.param('serviceURL');
                    userName = req.param('userName');
                    password = req.param('password');
                    optionName = "Current Open Tickets";

                    if(serviceType == "serviceNow") {

                        clientId = req.param('clientId');
                        clientSecret = req.param('clientSecret');
                        
                    }else{
                        tenantId = req.param('tenantId');
                    }
                }else{
                    path = req.param('path');
                    subScript = req.param("subScript");
                    if(requestName != "skype") {
                        
                        optionName = req.param("optionName");
                    } else {
                        optionName = "Transfer to Skype";
                    }
                }

                var options = {
                     "act": "list",
                        "type": constants.COMPANY_TABLE,
                        "in":{
                            "companyId": [companyId, compId]
                          }
                };
                  $fh.db(options, function(err, companyData) {
                  if(err) {
                    handleError(err, res);
                  } else {
                    console.log("companyData>>>"+JSON.stringify(companyData));
                    companyDetails = companyData;

                      if (companyData.count == 1) {

                        var allFields = companyData.list[0].fields;
                        console.log("requestName>>>",requestName);
                        if (requestName in allFields.selfSupport) {

                             res.json({errorResponse:{errorCode: constants.SET_SELF_SUPP_SUP_THERE_ERR, errorMessage: "Already this support there for this company Id."}});
                        } else {

                            console.log("else>>>selfSupport>>>",JSON.stringify(allFields.selfSupport));
                            if(requestName == "tickets") {

                                allFields.selfSupport[requestName]={};
                                newObj = allFields.selfSupport[requestName];
                                newObj['optionName'] = optionName;
                                newObj['serviceType'] = serviceType;
                                newObj['serviceURL'] = serviceURL;
                                newObj['userName'] = userName;
                                newObj['password'] = password;

                                if(serviceType == "serviceNow") {

                                    newObj['clientId'] = clientId;
                                    newObj['clientSecret'] = clientSecret;
                                    newObj['refreshToken'] = "";
                                    newObj['accessToken'] = "";
                                    newObj['tokenType'] = "";
                                }else{

                                    newObj['tenantId'] = tenantId;
                                    newObj['cookie'] = "";
                                }
                                allFields.selfSupport[requestName] = newObj;
                                updateSelfSupport(allFields);

                            } else {

                                allFields.selfSupport[requestName]={};
                                newObj = allFields.selfSupport[requestName];
                                newObj['optionName'] = optionName;
                                newObj['subScript'] = subScript;
                                newObj['path'] = path;
                                allFields.selfSupport[requestName] = newObj;
                                updateSelfSupport(allFields);
                          }
                        }
                      } else {
                         res.json({errorResponse:{errorCode: constants.SET_SELF_SUPP_COMPANY_ERR, errorMessage: "Company details not there for provided company Id ."}});
                      }
                    }
                });
                
              function updateSelfSupport(allFields, isCreate) {
                
                    newObj = allFields.selfSupport[requestName];
                    newObj['index'] = Object.keys(allFields.selfSupport).length - 1;
                    allFields.selfSupport[requestName] = newObj;
                
                    var createOption = {
                          "act": "update",
                          "guid": companyDetails.list[0].guid,
                          "type": constants.COMPANY_TABLE,
                          "fields": allFields
                        };
                        $fh.db(createOption, function (err, data) {
                          if (err) {
                           console.error("Error " + err);
                          } else {
                            console.log("updated data>>>"+JSON.stringify(data));
                              res.json({successResponse:{successCode: constants.SET_SELF_SUPP_SUC, successMessage: "Self Service added successfully"}});
                          }
                        });
              }
        });
        return setSkypeAddress;
    }
  module.exports = setSkypeAddressRoute;