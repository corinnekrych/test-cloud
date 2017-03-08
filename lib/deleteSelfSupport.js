        var express = require('express');
        var bodyParser = require('body-parser');
        var cors = require('cors');
        var $fh = require("fh-mbaas-api");
        var constants = require('./constants.js');

        function deleteSelfSupportRoute() {
            var deleteSelfSupport = new express.Router();
              deleteSelfSupport.use(cors());
              deleteSelfSupport.use(bodyParser());
              deleteSelfSupport.use(bodyParser.urlencoded());
              deleteSelfSupport.use(bodyParser.json());

          function handleError(err, response) {
                    var error = {
                        "message": err,
                        "code": 500
                    };
                    response.writeHead(500);
                    response.end(JSON.stringify(error));
            }
        //GET REST endpoint - query params may or may not be populated
        deleteSelfSupport.post('/', function(req, res) {
             console.log("req>>>",req);
                var companyId = req.param('companyId');
                var compId =  parseInt(companyId, 10);
                var requestName = req. param('requestName');
                var companyDetails;

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
                            delete allFields.selfSupport[requestName];
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
                                    console.log("deleted data>>>"+JSON.stringify(data));
                                    res.json({successResponse:{successCode: constants.DELETE_SELF_SUP_SUC, successMessage: "Self Service deleted successfully"}});
                                }
                            });                                                     

                        } else {
                             res.json({errorResponse:{errorCode: constants.DELETE_SELF_SUP_SERVICE_ERR, errorMessage: "No such service for provided company Id."}});
                            
                        }
                      } else {
                         res.json({errorResponse:{errorCode: constants.DELETE_SELF_SUP_COMPANY_ERR, errorMessage: "Company details not there for provided company Id."}});
                      }
                    }
                });
                
             
        });
        return deleteSelfSupport;
    }
  module.exports = deleteSelfSupportRoute;