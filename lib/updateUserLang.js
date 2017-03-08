var express = require('express');
        var bodyParser = require('body-parser');
        var cors = require('cors');
        var $fh = require("fh-mbaas-api");
         var constants = require('./constants.js');

            function updateUserDetailsRoute() {
              var updateUser = new express.Router();
              updateUser.use(cors());
              updateUser.use(bodyParser());
              updateUser.use(bodyParser.urlencoded());
              updateUser.use(bodyParser.json());

            function handleError(err, response) {
                var error = {
                        "message": err,
                        "code": 500
                };
                response.writeHead(500);
                response.end(JSON.stringify(error));
                }
                //POST REST endpoint - query params may or may not be populated
                updateUser.post('/', function(req, res) {
                var uniqueId = req.param('userUniqueId'); 
                var userSelectedLang = req.param('userSelectedLang');
                var emailId = req.param('emailId');
                var options = { 
                    "act": "read",
                    "type": "IS_User",
                    "guid": uniqueId
                };
                  $fh.db(options, function(err, fetchedRecord) {
                  if(err) {
                    handleError(err, res);
                  } else {
                    // console.log("user param:" + email + type + primaryPhoneNum + secondaryPhoneNum1 + secondaryPhoneNum2);
                    // console.log("response:" + userData);
                    var entityFields = fetchedRecord.fields;
                    entityFields.selectedLang = userSelectedLang;

                var updateOptions = {
                    "act": "update",
                    "type": "IS_User",
                    "guid": uniqueId,
                    "fields": entityFields
                }; 
                  $fh.db(updateOptions, function(err, updatedUserData) {
                  if(err) {
                    handleError(err, res);
                  } else { 
                    if (updatedUserData) {
                        res.json({updateResponse:{message: "Updated Successfully!!!.", userUniqueId: updatedUserData.guid, userData: updatedUserData.fields }});
                    } else {
                        res.json({errorResponse:{errorCode: constants.UPDATE_USER_LANG_ERR, errorMessage: "Some problem in updating user language"}});
                    }   
                  }
                });
                  }
                });
              });
            return updateUser;
        }
        module.exports = updateUserDetailsRoute;