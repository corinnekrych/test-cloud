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
    updateUser.post('/', function (req, res) {
        var email = req.param('emailId');
        var type = req.param('type');
        var userType = parseInt(type, 10);
        var primaryPhoneNum = req.param('primaryPhoneNum');
        var secondaryPhoneNum1 = req.param('secondaryPhoneNum1');
        var secondaryPhoneNum2 = req.param('secondaryPhoneNum2');
        var userSelectedLang = req.param('userSelectedLang');
        if (!userSelectedLang) {
            res.json({ errorResponse: { errorCode: constants.UPDATE_USER_LANG_EMPTY, errorMessage: "User selected language can not be empty." } });
        }
        var pattern = new RegExp("-");
        if (primaryPhoneNum && pattern.test(primaryPhoneNum)) {
            var options = {
                "act": "list",
                "type": "IS_User",
                "in": {
                    "type": [type, userType]
                },
                "eq": {
                    "userEmail": email,
                }
            };
            $fh.db(options, function (err, userData) {
                if (err) {
                    handleError(err, res);
                } else {
                    console.log("user param:" + email + type + primaryPhoneNum + secondaryPhoneNum1 + secondaryPhoneNum2);
                    console.log("response:" + userData);
                    if (userData.count == 1) {

                        var entityFields = userData.list[0].fields;
                        entityFields.primaryPhoneNum = primaryPhoneNum;
                        entityFields.secondaryPhoneNum1 = secondaryPhoneNum1;
                        entityFields.secondaryPhoneNum2 = secondaryPhoneNum2;
                        entityFields.selectedLang = userSelectedLang;
                        var updateOptions = {
                            "act": "update",
                            "type": "IS_User",
                            "guid": userData.list[0].guid,
                            "fields": entityFields
                        };
                        $fh.db(updateOptions, function (err, updatedUserData) {
                            if (err) {
                                handleError(err, res);
                            } else {
                                if (updatedUserData) {
                                    res.json({ updateResponse: { message: "Updated Successfully!!!.", userUniqueId: updatedUserData.guid, userData: updatedUserData.fields } });
                                } else {
                                    res.json({ errorResponse: { errorCode: constants.UPDATE_USER_ERR, errorMessage: "Some problem in updating user details" } });
                                }
                            }
                        });
                    } else {
                        res.json({ errorResponse: { errorCode: constants.UPDATE_USER_NOT_FOUND_ERR, errorMessage: "Unable to find the user details to update." } });
                    }
                }
            });
        } else {
            res.json({ errorResponse: { errorCode: constants.UPDATE_USER_PRIM_NUM_ERR, errorMessage: "Primary number can not be empty and should contain \"-" } });
        }
    });
    return updateUser;
}
module.exports = updateUserDetailsRoute;