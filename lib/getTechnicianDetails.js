var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require("fh-mbaas-api");
var constants = require('./constants.js');

function techDetailsRoute() {
    var techDetails = new express.Router();
    techDetails.use(cors());
    techDetails.use(bodyParser());
    techDetails.use(bodyParser.urlencoded());
    techDetails.use(bodyParser.json());

    function handleError(err, response, code, errorObj) {
        var error = {
            "message": err,
            "code": code,
            "errorObj": errorObj
        };
        response.writeHead(500);
        response.end(JSON.stringify(error));
    }

    //GET REST endpoint - query params may or may not be populated
    techDetails.get('/', function (req, res) {
        var email;
        var backUpTechId, backUpTechNum, backUpTechStatus, backUpTechName, myBackUpTechData, backUpTechUniqueId;
        if (req.query && req.query.emailId) {

            email = req.param('emailId');
        }
        console.log("emailId of tech>>>>>>>>>>" + email);
        var options = {
            "act": "list",
            "type": constants.TECHNICIAN_TABLE,
            "eq": {
                "userId": email
            }
        };
        $fh.db(options, function (err, techData) {
            if (err) {
                handleError("Due to some problem we are not able to get primary tech details.", res, constants.GET_PRI_TECH_ERR, err);
            } else {
                var domainParam;
                console.log("techData of tech>>>>>>>>>>" + JSON.stringify(techData));
                if (techData.count == 1) {
                    console.log("tech user data retrieved");
                    // if (parseInt(techData.list[0].fields.status, 10) == 1) {
                    console.log("retrieve back tech user data");
                    techData.list[0].fields.techUniqueId = techData.list[0].guid;
                    getPhoneNumber(email, function (techPhoneNumber) {
                        techData.list[0].fields.phoneNum = techPhoneNumber;
                        if (typeof techData.list[0].fields.substituteTId != 'undefined') {
                            var backUpOptions = {
                                act: "list",
                                type: constants.TECHNICIAN_TABLE,
                                "eq": {
                                    "userId": techData.list[0].fields.substituteTId
                                }
                            };
                            $fh.db(backUpOptions, function (err, backUpTechData) {
                                if (err) {
                                    handleError("Due to some problem we are not able to get back up tech details.", res, constants.GET_SEC_TECH_ERR, err);
                                } else if (backUpTechData.count == 1) {
                                    console.log("back tech user data retrieved.");
                                    getPhoneNumber(techData.list[0].fields.substituteTId, function (backupTechPhoneNumber) {
                                        backUpTechData.list[0].fields.phoneNum = backupTechPhoneNumber;
                                        myBackUpTechData = backUpTechData.list[0].fields;
                                        myBackUpTechData.backUpTechUniqueId = backUpTechData.list[0].guid;
                                        res.json({ techDetails: techData.list[0].fields, backupTechDetails: myBackUpTechData });
                                    });
                                } else {
                                    // res.json({errorResponse:{errorCode: 100010, errorMessage: "Not able to find back up tech details."}});
                                    res.json({ techDetails: techData.list[0].fields, backupTechDetails: myBackUpTechData });
                                }
                            });
                        } else {
                            res.json({ techDetails: techData.list[0].fields, backupTechDetails: myBackUpTechData });
                        }
                    });
                } else {
                    res.json({ errorResponse: { errorCode: constants.GET_TECT_NOT_AVAL_ERR, errorMessage: "Not able to find this particular tech details." } });
                }
            }
        });
        function getPhoneNumber(emailId, callback) {
            var options = {
                "act": "list",
                "type": constants.USER_TABLE,
                "eq": {
                    "userEmail": emailId
                }
            };
            $fh.db(options, function (err, techUserData) {
                if (err) {
                    handleError("Due to some problem we are not able to get tech Phone number details.", res, constants.GET_PRI_TECH_ERR, err);
                } else {
                    console.log("emailId>>>>" + emailId + "  techUserData>>>" + JSON.stringify(techUserData));
                    if (techUserData.count == 1) {
                        if ("primaryPhoneNum" in techUserData.list[0].fields) {
                            callback(techUserData.list[0].fields.primaryPhoneNum);
                        } else {
                            callback("");
                        }
                    } else {
                        res.json({ errorResponse: { errorCode: constants.GET_TECT_NOT_AVAL_ERR, errorMessage: "Not able get a particular tech details." } });
                    }
                }
            });
        }
    });
    return techDetails;
}
module.exports = techDetailsRoute;