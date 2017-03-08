var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require("fh-mbaas-api");
var constants = require('./constants.js');
var fs = require('fs');

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
        
        createUser.post('/', function(req, res) {

            var usersData = req.param('usersData');
            
            console.log(JSON.stringify(usersData));

            var usersEmailIds = usersData.map(function(a) {return a.userEmail;});

            checkUserEmailId(usersEmailIds, function(userExistData) {
                    
                    console.log("userExistData>>>>"+userExistData);
                    if(userExistData.length >= 1) {

                        res.json({errorCode: constants.CRT_MUL_USER_EXIST_ERR, errorMessage: "There users are already exist: " + userExistData });
                         
                    }else{

                        var createUserOptions = {
                            "act": "create",
                            "type": constants.USER_TABLE,
                            "fields": usersData
                        };
            
                        $fh.db(createUserOptions, function(err, result) {
                            if(err) {
                                handleError(err, res);
                            } else {
                                res.json({successCode: constants.CREATE_USER_SUC, noOfUserCreated: usersData.length, successMessage: "User Created successfully."});
                            }    
                        });

                    } 

            });
             

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
                            var userServerExitIds = userEmailIdCheckData.list.map(function(a) {return a.fields.userEmail;});
                            console.log("userServerExitIds>>>>>>>>"+JSON.stringify(userServerExitIds));
                            userExistData  = userServerExitIds.filter(function(val) {
                                return usersemailId.indexOf(val) > -1;
                            });
                            console.log("i am called after database call complete>>>>"+userExistData);
                            callback(userExistData);            
                        }
                    });
                    console.log("i am called before database call complete");
            }
        });
        return createUser;
    }
module.exports = createUserRoute;


