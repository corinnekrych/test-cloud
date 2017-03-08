var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require("fh-mbaas-api");
var constants = require('./constants.js');

function userDetailsRoute() {
    var userDetails = new express.Router();
    userDetails.use(cors());
    userDetails.use(bodyParser());
    userDetails.use(bodyParser.urlencoded());
    userDetails.use(bodyParser.json());

    function handleError(err, response) {
        var error = {
            "message": err,
            "code": 500
        };
        response.writeHead(500);
        response.end(JSON.stringify(error));
    }

    // GET REST endpoint - query params may or may not be populated
    userDetails.get('/', function (req, res) {
        var email;
        if (req.query && req.query.emailId) {
            email = req.param('emailId');
            console.log("email>>>>>>>>>>>" + email);
        }
        var options = {
            "act": "list",
            "type": "IS_User",
            "eq": {
                "userEmail": email
            }
        };
        $fh.db(options, function (err, userData) {
            if (err) {
                handleError(err, res);
            } else {
                var companyId, techId, compId;
                console.log("userData >>>>>>" + JSON.stringify(userData));
                if (userData.count == 1 && userData.list[0].fields.companyId) {

                    companyId = userData.list[0].fields.companyId;
                    compId = parseInt(companyId, 10);
                    $fh.db({
                        act: "list",
                        type: "IS_Company",
                        "in": {
                            "companyId": [companyId, compId]
                        }
                    }, function (err, companyDetails) {
                        console.log("companyDetails >>>>>>" + JSON.stringify(companyDetails));
                        if (err) {
                            handleError(err, res);
                        } else if (companyDetails.count == 1 && companyDetails.list[0].fields.companyName && companyDetails.list[0].fields.companyId) {
                            var compConfigDetails = [];
                            var commonConfig = [];
                            var index;
                            if (parseInt(userData.list[0].fields.type, 10) == 1 && typeof companyDetails.list[0].fields.config_U0 != 'undefined') {
                                commonConfig = companyDetails.list[0].fields.config_U0;
                            } else if (parseInt(userData.list[0].fields.type, 10) == 2) {
                                if (typeof companyDetails.list[0].fields.config_U1 != 'undefined') {
                                    console.log("companyDetails.list[0].fields.config_U1>>>>>>>>>>>>" + companyDetails.list[0].fields.config_U1);
                                    commonConfig = companyDetails.list[0].fields.config_U1;
                                }
                                techId = userData.list[0].fields.assignedTechnician;
                            }
                            for (index = 0; index < commonConfig.length; index++) {
                                compConfigDetails.push(commonConfig[index]);
                            }
                            var passwordUrl;
                            var resetPasswordIndex = compConfigDetails.indexOf("RP");
                            if (resetPasswordIndex > -1) {
                                if (companyDetails.list[0].fields.resetPasswordUrl) {
                                    passwordUrl = companyDetails.list[0].fields.resetPasswordUrl;
                                } else {
                                    compConfigDetails.splice(resetPasswordIndex, 1);
                                }
                            }
                            var selfSupportOptions = [];
                            if (companyDetails.list[0].fields.selfSupport) {
                                Object.keys(companyDetails.list[0].fields.selfSupport).forEach(function (key) {
                                    selfSupportOptions.push(companyDetails.list[0].fields.selfSupport[key]);
                                });
                            }
                            res.json({
                                userProfile: {
                                    userDetails: {
                                        userName: userData.list[0].fields.userName, emailId: userData.list[0].fields.userEmail
                                        , primaryPhone: userData.list[0].fields.primaryPhoneNum,
                                        secondaryPhone1: userData.list[0].fields.secondaryPhoneNum1, secondaryPhone2: userData.list[0].fields.secondaryPhoneNum2,
                                        userType: userData.list[0].fields.type, assignedTechId: techId, userSelectedLang: userData.list[0].fields.selectedLang, userUniqueId: userData.list[0].guid
                                    }, profileDetails:
                                    {
                                        companyUniqueId: companyDetails.list[0].guid, companyName: companyDetails.list[0].fields.companyName, companyId: companyDetails.list[0].fields.companyId, companyLogo: companyDetails.list[0].fields.companyLogo,
                                        compConfig: compConfigDetails, companyPasswordResetUrl: passwordUrl, languageSupported: companyDetails.list[0].fields.langSupported, selfSupport: selfSupportOptions
                                    }
                                }
                            });
                        } else {
                            res.json({ errorResponse: { errorCode: constants.UPDATE_USER_PRO_NO_COMPY, errorMessage: "No company details exist for provided domain." } });
                        }
                    });
                } else {
                    res.json({ errorResponse: { errorCode: constants.UPDATE_USER_PRO_NO_USER, errorMessage: "User doesn't exist." } });
                }
            }
        });
    });
    return userDetails;
}
module.exports = userDetailsRoute;

