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

            var techUsersData = req.param('techUsersData');
            

            var usersEmailIds = techUsersData.map(function(a) {return a.userEmail;});

            checkUserEmailId(usersEmailIds, function(userExistData) {

                if(userExistData.length >=1) {

                    res.json({errorCode: constants.CRT_MUL_USER_EXIST_ERR, errorMessage: "There users are already exist: " + userExistData });
                         
                }else{

                    extractTechData(techUsersData,function(userTableData, techTableData) {

                        if(userTableData.length == techUsersData.length && techTableData.length == techUsersData.length) {
                            
                            var createUserOptions = {
                                "act": "create",
                                "type": constants.USER_TABLE,
                                "fields": userTableData
                            };
            
                        $fh.db(createUserOptions, function(err, result) {
                            if(err) {
                                handleError(err, res);
                            } else {
                                var createUserOptions = {
                                    "act": "create",
                                    "type": constants.TECHNICIAN_TABLE,
                                    "fields": techTableData
                                };
            
                                 $fh.db(createUserOptions, function(err, result) {
                                    if(err) {
                                         handleError(err, res);
                                    } else {
                                        res.json({successCode: constants.CREATE_USER_SUC, noOfUserCreated: techUsersData.length, successMessage: "User Created successfully."});
                                    } 
                                });  
                            }        
                        });  
                    }else{
                        res.json({errorCode : constants.CRT_TECH_MULTI_USER_ERR , errorMessage : "Error occured while fetching data."});
                    }
                });
            }
        });
        
        function extractTechData(techUsersData, callbackFunction) {

            var userTableData = [];
            var techTableData =[];

            for(var index = 0; index < techUsersData.length; index++) {

                var userData = {
                    "userName" : techUsersData[index].userName,
                    "userEmail" : techUsersData[index].userEmail,
                    "type" : techUsersData[index].type,
                    "domain" : techUsersData[index].domain,
                    "primaryPhoneNum" : techUsersData[index].primaryPhoneNum,
                    "secondaryPhoneNum1" : techUsersData[index].secondaryPhoneNum1,
                    "secondaryPhoneNum2" : techUsersData[index].secondaryPhoneNum2,
                    "selectedLang" : techUsersData[index].selectedLang,
                    "companyId" : techUsersData[index].companyId
                };

                var techData = {
                    "companyId" : techUsersData[index].companyId,
                    "Name" : techUsersData[index].Name,
                    "userId" : techUsersData[index].userId,
                    "substituteTId" :techUsersData[index].substituteTId,
                    "status" : 1,
                    "phoneNum" : techUsersData[index].phoneNum,
                    "location" : techUsersData[index].location,
                    "latitude" : techUsersData[index].latitude,
                    "longitude" : techUsersData[index].longitude,
                    "tracking" : techUsersData[index].tracking
                };

                userTableData.push(userData);
                techTableData.push(techData);
            }
            callbackFunction(userTableData, techTableData);
        }

        function checkUserEmailId(usersemailId,callback) {
                 var readOptions = {
                        "act": "list",
                        "type": constants.USER_TABLE,
                        "fields": ["userEmail"]
                    };
                    $fh.db(readOptions, function(err, userEmailIdCheckData) {
                        if(err) {
                            handleError(err, res);
                        } else {
                        
                            var userExistData =[];
                            console.log("userEmailIdCheckData>>>>>>>>"+JSON.stringify(userEmailIdCheckData));
                            var userServerExitIds = userEmailIdCheckData.list.map(function(a) {return a.fields.userEmail;});
                            console.log("userServerExitIds>>>>>>>>"+JSON.stringify(userServerExitIds));
                            userExistData  = userServerExitIds.filter(function(val) {
                                return usersemailId.indexOf(val) > -1;
                            });
                            console.log("i am called after database call complete");   
                            callback(userExistData);                                
                        }
                    });
                    console.log("i am called before database call complete");
            }
      });
      return createUser;
    }
module.exports = createUserRoute;


