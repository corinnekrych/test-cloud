var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require("fh-mbaas-api");
var constants = require('./constants.js');

    function companyRoute() {
      var compDetails = new express.Router();
      compDetails.use(cors());
      compDetails.use(bodyParser());
      compDetails.use(bodyParser.urlencoded());
      compDetails.use(bodyParser.json());

        function handleError(err, response){
            var error = {
                "message": err,
                "code": 500
            };
            response.writeHead(500);
            response.end(JSON.stringify(error));
        }

      function fetchUsersforCompanyId(callBack) {
        var options = {
            "act": "list",
            "type": "IS_User",
        };
          $fh.db(options, function(err, userData) {
          if(err) {
            callBack(err, nil);
          } else {
              var usersObj = [];
              for ( index = 0; index < userData.list.length; index++ ) {
                    userData.list[index].fields.uniqueId = userData.list[index].guid;
                    usersObj.push(userData.list[index].fields);
              }   
            callBack(null, usersObj);
          }
        });
      }
        // GET REST endpoint - query params may or may not be populated
        compDetails.get('/', function(req, res) {
        
        var options = {
            "act": "list",
            "type": "IS_Company",
        };
          $fh.db(options, function(err, compData) {
          if(err){
            handleError(err, res);
          } else {
            if (compData.count >= 1) {
              
               var compDetailsObj = [];
               var users = [];
              fetchUsersforCompanyId(function(error, userObj) {
                
                if (err) {
                  console.log("No user available in the platform");
                } else {
                    users = userObj;
                  for ( index = 0; index < compData.list.length; index++ ) {
                    compData.list[index].fields.uniqueId = compData.list[index].guid;
                    compData.list[index].fields.compUsers = users.filter(function(obj) {
                      return parseInt(obj.companyId, 10) === parseInt(compData.list[index].fields.companyId, 10);
                    });
                    compDetailsObj.push(compData.list[index].fields);
                }
               res.json({companies: compDetailsObj, status: "Records fetched successfully"});

                }
              });
          } else {
            res.json({errorResponse:{errorCode: constants.GET_COMPANY_NOT_THERE_ERR, errorMessage: "No company exist in database."}});
          }
          }
        });
      });
      return compDetails;
    }
module.exports = companyRoute;

