var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require("fh-mbaas-api");
var constants = require('./constants.js');

    function updateCompanyRoute() {
      var updateCompDetails = new express.Router();
      updateCompDetails.use(cors());
      updateCompDetails.use(bodyParser());
      updateCompDetails.use(bodyParser.urlencoded());
      updateCompDetails.use(bodyParser.json());

        function handleError(err, response){
            var error = {
                "message": err,
                "code": 500
            };
            response.writeHead(500);
            response.end(JSON.stringify(error));
        }

        // GET REST endpoint - query params may or may not be populated
        updateCompDetails.post('/', function(req, res) {
          var compId = req.param('companyId');
          var companyId = parseInt(compId, 10);
          var companyName = req.param('companyName');
          var companyLogo = req.param('companyLogo');
          var options = {
                    "act": "list",
                    "type": constants.COMPANY_TABLE,
                    "in": {
                           "companyId": [companyId, compId]
                          }
                };
          $fh.db(options, function(err, compData) {
            if(err){
              handleError(err, res);
            } else {
                if(compData.count == 1){
                    console.log("compData>>>>"+JSON.stringify(compData));
                    var allFields = compData.list[0].fields;
                    allFields.companyName = companyName;
                    allFields.companyLogo = companyLogo;
                    var createOption = {
                          "act": "update",
                          "guid": compData.list[0].guid,
                          "type": constants.COMPANY_TABLE,
                          "fields": allFields
                        };
                        $fh.db(createOption, function (err, data) {
                          if (err) {
                           console.error("Error " + err);
                          } else {
                              res.json({successResponse:{successCode: constants.UPDATE_COMP_DET_SUC, successMessage: "Company details updated successfully."}});
                          }
                        });
                }else {
                    res.json({errorResponse:{errorCode: constants.UPDATE_COMP_DET_ERR, errorMessage: "Company does not exist."}});
                }
          }
        });
      });
      return updateCompDetails;
    }
module.exports = updateCompanyRoute;

