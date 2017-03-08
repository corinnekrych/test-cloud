        var express = require('express');
        var bodyParser = require('body-parser');
        var cors = require('cors');
        var $fh = require("fh-mbaas-api");
        var constants = require('./constants.js');

        function updateSelfSupportRoute() {
            var updateSelfSupport = new express.Router();
              updateSelfSupport.use(cors());
              updateSelfSupport.use(bodyParser());
              updateSelfSupport.use(bodyParser.urlencoded());
              updateSelfSupport.use(bodyParser.json());

          function handleError(err, response) {
                    var error = {
                        "message": err,
                        "code": 500
                    };
                    response.writeHead(500);
                    response.end(JSON.stringify(error));
            }
        //GET REST endpoint - query params may or may not be populated
        updateSelfSupport.post('/', function(req, res) {
             console.log("req>>>",req);
                var companyId = req.param('companyId');
                var compId =  parseInt(companyId, 10);
                var requestName = req. param('requestName');
                var path, optionName, subScript, serviceType, serviceURL, clientId, clientSecret, userName, password, newObj ,companyDetails, tenantId, newRequestName;

                if(requestName == "tickets") {

                    serviceType = req.param('serviceType');
                    serviceURL = req.param('serviceURL');
                    userName = req.param('userName');
                    password = req.param('password');

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
                        
                        newRequestName = req.param("newRequestName");
                        optionName = req.param("optionName");
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
                        console.log(">>>selfSupport>>>",JSON.stringify(allFields.selfSupport));
                            if(requestName == "tickets") {

                                newObj = allFields.selfSupport[requestName];
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
                                if(requestName != "skype") {

                                    allFields.selfSupport[newRequestName] = allFields.selfSupport[requestName];
                                    delete allFields.selfSupport[requestName];
                                    newObj = allFields.selfSupport[newRequestName];
                                    newObj['subScript'] = subScript;
                                    newObj['path'] = path;
                                    newObj['optionName'] = optionName;
                                    allFields.selfSupport[newRequestName] = newObj;
                                }else {

                                    newObj = allFields.selfSupport[requestName];
                                    newObj['subScript'] = subScript;
                                    newObj['path'] = path;
                                    allFields.selfSupport[requestName] = newObj;
                                }
                                
                                updateSelfSupport(allFields);
                          }
                            
                        } else {
                             res.json({errorResponse:{errorCode: constants.UPDATE_SELF_SUP_SERVICE_ERR, errorMessage: "No such service for provided company Id."}});
                            
                        }
                      } else {
                         res.json({errorResponse:{errorCode: constants.UPDATE_SELF_SUP_COMPANY_ERR, errorMessage: "Company details not there for provided company Id."}});
                      }
                    }
                });
                
              function updateSelfSupport(allFields, isCreate) {
                
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
                                res.json({successResponse:{successCode: constants.UPDATE_SELF_SUP_SUC, successMessage: "Self Service updated successfully"}});
                          }
                        });
              }
        });
        return updateSelfSupport;
    }
  module.exports = updateSelfSupportRoute;