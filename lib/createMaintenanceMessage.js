var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require("fh-mbaas-api");
var constants = require('./constants.js');

function maintenanceMessageRoute() {
    var maintenanceMessage = new express.Router();
    maintenanceMessage.use(cors());
    maintenanceMessage.use(bodyParser());
    maintenanceMessage.use(bodyParser.urlencoded());
    maintenanceMessage.use(bodyParser.json());

    function handleError(err, response) {
        var error = {
            "message": err,
            "code": 500
        };
        response.writeHead(500);
        response.end(JSON.stringify(error));
    }
    //GET REST endpoint - query params may or may not be populated
    maintenanceMessage.post('/', function (req, res) {

        var compId = req.param('companyId');
        var companyId = parseInt(compId, 10);
        var lang = req.param('language');
        var expiryType = req.param('expiryType');
        var region = req.param('region');
        var location = req.param('location');
        var createdDate = req.param('createdDate');
        var title = req.param('title');
        var Description = req.param('Description');
        var outageType = req.param('outageType');
        var expireTime;
        var allfields = {
            "companyId": companyId,
            "lang": lang,
            "status": 1,
            "expiryType": expiryType,
            "region": region,
            "location": location,
            "createdDate": createdDate,
            "title": title,
            "Description": Description,
            "outageType": outageType
        };
        if (expiryType == 2) {
            expireTime = req.param('expireTime');
            allfields["expireTime"] = expireTime;
        }
        var options = {
            "act": "list",
            "type": constants.MAINTENANCE_MSG_TABLE,
            "fields": ["messageId"]
        };
        $fh.db(options, function (err, maintenanceData) {
            if (err) {
                console.error("Error " + err);
            } else {
                var maxMessageId;
                if (maintenanceData.list.length === 0) {
                    maxMessageId = 0;
                } else {
                    var arrMessageId = [];
                    for (var index = 0; index < maintenanceData.list.length; index++) {
                        arrMessageId.push(maintenanceData.list[index].fields.messageId);
                    }
                    arrMessageId.sort(function (value1, value2) { return value1 - value2 });
                    maxMessageId = arrMessageId[arrMessageId.length - 1];
                }
                allfields["messageId"] = maxMessageId + 1;
                var createOption = {
                    "act": "create",
                    "type": constants.MAINTENANCE_MSG_TABLE,
                    "fields": allfields
                };
                $fh.db(createOption, function (err, data) {
                    if (err) {
                        console.error("Error " + err);
                    } else {
                        //res.json({successResponse:{successCode: constants.CRT_MAINTENANCE_MSG_SUC, successMessage: "Maintenance Message created successfully."}});

                        if (outageType == "notification") {
                            var readOptions = {
                                "act": "list",
                                "type": constants.USER_TABLE,
                                "in": {
                                    "companyId": [companyId, compId]
                                },
                                "fields": ["userEmail"]
                            };
                            $fh.db(readOptions, function (err, userEmailIdCheckData) {
                                if (err) {
                                    handleError(err, res);
                                } else {

                                    var userEmailIds = userEmailIdCheckData.list.map(function (a) { return a.fields.userEmail; });
                                    console.log("userEmailIds>>>>>>>>" + JSON.stringify(userEmailIds));
                                    console.log(userEmailIds);

                                    var message = {
                                        alert: Description
                                    },
                                        options = {
                                            broadcast: false, 
                                            apps: ["j3hwv6pfa5rtm73a563rr3vw", "j3hwv6jn5odgbnevowvp4neb"],
                                            criteria: {
                                                categories: userEmailIds
                                            }
                                        };
                                    $fh.push(message, options,

                                        function (err, response) {
                                            if (err) {
                                                console.log(err.toString());
                                            } else {
                                                console.log("status : " + response);
                                                res.json({ successResponse: { successCode: constants.CRT_MAINTENANCE_MSG_SUC, successMessage: "Maintenance Message created successfully." } });
                                            }
                                        });
                                }
                            });
                        }

                    }
                });
            }
        });

    });
    return maintenanceMessage;
}
module.exports = maintenanceMessageRoute;