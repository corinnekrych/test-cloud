var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require("fh-mbaas-api");
var constants = require('./constants.js');

    function createUserRoute() {
      var createUser = new express.Router();
      createUser.use(cors());
      createUser.use(bodyParser());
      createUser.use(bodyParser.urlencoded());
      createUser.use(bodyParser.json());

        function handleError(err, response){
            var error = {
                "message": err,
                "code": 500
            };
            response.writeHead(500);
            response.end(JSON.stringify(error));
        }
        // GET REST endpoint - query params may or may not be populated
        createUser.post('/', function(req, res) {

            var assignedTechnician, substituteTId, location, latitude, longitude, tracking;
            var userName = req.param('userName');
            var userEmail = req.param('userEmail');
            var type = req.param('type');
            var domain = req.param('domain');
            var primaryPhoneNum = req.param('primaryPhoneNum');
            var secondaryPhoneNum1 = req.param('secondaryPhoneNum1');
            var secondaryPhoneNum2 = req.param('secondaryPhoneNum2');
            var selectedLang = req.param('selectedLang');
            var compId = req.param('companyId');
            var companyId = parseInt(compId, 10);
            if(type == "2") { 
              assignedTechnician = req.param('assignedTechnician');
            }else if(type == "3") {
              substituteTId = req.param('substituteTId');
              location = req.param('location');
              latitude = req.param('latitude');
              longitude = req.param('longitude');
              tracking = req.param('tracking');
            }
            console.log("companyId>>>>>>"+ companyId +"compId>>>>>"+compId);
             var readOptions = {
                "act": "list",
                "type": constants.COMPANY_TABLE,
                "in": {
                        "companyId": [companyId, compId]
                    }
            };
             $fh.db(readOptions, function(err, result){
                if(err) {
                  handleError(err, res);
                } else {
                  console.log("result>>>>>>readCompany>>>>>"+JSON.stringify(result));
                  if(result.count == 1) {
                     var readUserOptions = {
                        "act": "list",
                        "type": constants.USER_TABLE,
                        "eq":{
                            "userEmail": userEmail
                          },
                        "in": {
                           "companyId": [companyId, compId]
                          }
                          
                      };
                      $fh.db(readUserOptions, function(err, result){
                      if(err) {
                          handleError(err, res);
                      } else {
                        console.log("result>>>>>>readUserOptions>>>>>"+JSON.stringify(result));
                         if(result.count >= 1) {
                            res.json({errorCode: constants.CREATE_USER_ALREADY_EXIST, successMessage: "User with provided email id already exist."});
                         } else {
                           
                           var createUserOptions;
                           if(type == "1" || type == "3") {
                              createUserOptions = {
                                "act": "create",
                                "type": constants.USER_TABLE,
                                "fields": {
                                    "userName" : userName,
                                    "userEmail" : userEmail,
                                    "type" :type,
                                    "domain" : domain,
                                    "primaryPhoneNum" : primaryPhoneNum,
                                    "secondaryPhoneNum1" : secondaryPhoneNum1,
                                    "secondaryPhoneNum2" : secondaryPhoneNum2,
                                    "selectedLang" : selectedLang,
                                    "companyId" : companyId
                                  }
                              };
                           } else {
                             createUserOptions = {
                                "act": "create",
                                "type": constants.USER_TABLE,
                                "fields": {
                                    "userName" : userName,
                                    "userEmail" : userEmail,
                                    "type" :type,
                                    "domain" : domain,
                                    "primaryPhoneNum" : primaryPhoneNum,
                                    "secondaryPhoneNum1" : secondaryPhoneNum1,
                                    "secondaryPhoneNum2" : secondaryPhoneNum2,
                                    "selectedLang" : selectedLang,
                                    "companyId" : companyId,
                                    "assignedTechnician" : assignedTechnician
                                  }
                              };
                           }
                              $fh.db(createUserOptions, function(err, result) {
                                if (err) {
                                  handleError(err, res);
                                } else {
                                  console.log("result>>>>>>createUser>>>>>"+JSON.stringify(result));
                                  if (type == "3") {
                                  var createTechUserOptions = {
                                      "act": "create",
                                      "type": constants.TECHNICIAN_TABLE,
                                      "fields": {
                                          "companyId" : companyId,
                                          "Name" : userName,
                                          "userId" : userEmail,
                                          "substituteTId" :substituteTId,
                                          "status" : 1,
                                          "phoneNum" : primaryPhoneNum,
                                          "location" : location,
                                          "latitude" : latitude,
                                          "longitude" : longitude,
                                          "tracking" : tracking
                                      }
                                    };
                                    $fh.db(createTechUserOptions, function(err, result) {
                                      if(err) {
                                        handleError(err, res);
                                      } else {
                                        console.log("result>>>>>>createUserIn TEch table>>>>>"+JSON.stringify(result));
                                        res.json({successCode: constants.CREATE_USER_SUC, successMessage: "User Created successfully."});
                                      }
                                    });
                                  } else {
                                    res.json({successCode: constants.CREATE_USER_SUC, successMessage: "User Created successfully."});
                                  }
                                }
                              });
                         }
                      }
                      });
                  
                  } else {
                    res.json({errorCode: constants.CREATE_USER_COMP_NOT_ERR, errorMessage: "Error in company Id."});
                  }
                } 
            });
      });
      return createUser;
    }
module.exports = createUserRoute;


