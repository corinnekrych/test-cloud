var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require("fh-mbaas-api");
var constants = require('./constants.js');

    function UserDataRoute() {
      var userDetails = new express.Router();
      userDetails.use(cors());
      userDetails.use(bodyParser());
      userDetails.use(bodyParser.urlencoded());
      userDetails.use(bodyParser.json());

        function handleError(err, response){
            var error = {
                "message": err,
                "code": 500
            };
            response.writeHead(500);
            response.end(JSON.stringify(error));
        }

        // GET REST endpoint - query params may or may not be populated
        userDetails.get('/', function(req, res) {
          var compId = req.param('companyId');
          var companyId = parseInt(compId, 10);
          var userType = req.param('userType');
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
              console.log("compData>>>>"+JSON.stringify(compData));
              if (compData.count == 1) {
                 var options = {
                    "act": "list",
                    "type": constants.USER_TABLE,
                    "in": {
                           "companyId": [companyId, compId],
                           "type": [userType, parseInt(userType, 10)]
                          }
                  };
                $fh.db(options, function(err, userData) {
                  if(err) {
                    handleError(err, res);
                  } else {
                      console.log("userDetails>>>>"+JSON.stringify(userData));
                      var userDetails = [];
                        for(var index = 0; index < userData.list.length; index++){
                            userDetails.push(userData.list[index].fields);
                        }
                      res.json({UserData: userDetails, status: "Records fetched successfully"});
                  }
              });
          } else {
            res.json({errorResponse:{errorCode: constants.GET_USER_DETAIL_COMPANY_ERR, errorMessage: "No company exist in database."}});
          }
          }
        });
      });
      return userDetails;
    }
module.exports = UserDataRoute;

