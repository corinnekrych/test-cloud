var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require("fh-mbaas-api");
var constants = require('./constants.js');
var request = require('request');

function serviceNowRoute() {
    var serviceNow = new express.Router();
    serviceNow.use(cors());
    serviceNow.use(bodyParser());
    serviceNow.use(bodyParser.urlencoded());
    serviceNow.use(bodyParser.json());

    function handleError(err, response) {
        var error = {
            "message": err,
            "code": 500
        };
        response.writeHead(500);
        response.end(JSON.stringify(error));
    }
    //GET REST endpoint - query params may or may not be populated
    serviceNow.get('/', function (req, res) {
        var compId = req.param('companyId');
        var companyId = parseInt(compId, 10);
        var emailId = req.param("emailId");
        var allFields, authData, serviceDetails, serviceUniqueId;
        var openTickets = [];

        var options = {
            "act": "list",
            "type": constants.COMPANY_TABLE,
            "in": {
                "companyId": [companyId, compId]
            }
        };
        $fh.db(options, function (err, compData) {
            if (err) {
                handleError(err, res);
            } else {
                console.log("compData>>>>" + JSON.stringify(compData));
                if (compData.count == 1) {

                    allFields = compData.list[0].fields;
                    serviceUniqueId = compData.list[0].guid;
                    console.log("allFields>>>>" + JSON.stringify(allFields));

                    if (allFields.hasOwnProperty('selfSupport') && allFields.selfSupport.hasOwnProperty('tickets')) {

                        serviceDetails = allFields.selfSupport.tickets;
                        if (allFields.selfSupport.tickets.serviceType == 'serviceNow') {

                            if (serviceDetails.tokenType !== "" && serviceDetails.accessToken !== "") {
                                console.log("going to getSysIdServiceNow");
                                getSysIdServiceNow(serviceDetails.tokenType + ' ' + serviceDetails.accessToken);
                            } else {
                                console.log("going to createAccessToken");
                                createAccessToken();
                            }
                        } else {

                            var serviceURL = serviceDetails.serviceURL + 'rest/' + serviceDetails.tenantId + '/ems/Request?layout=Id,Status,DisplayLabel,Description&filter=Status=%27RequestStatusInProgress%27%20and%20RequestedForPerson.Email=%27' + emailId + '%27';
                            console.log("serviceURL>>>>>>" + serviceURL);
                            console.log("serviceDetails>>>>>>>>>." + JSON.stringify(serviceDetails));
                            if (serviceDetails.cookie !== "") {
                                console.log("going to getOpenServiceAnyWhereTickets");
                                getOpenServiceAnyWhereTickets(serviceDetails.cookie);
                            } else {
                                console.log("going to serviceAnyWhereLogin");
                                serviceAnyWhereLogin();
                            }


                        }
                    } else {
                        res.json({ errorResponse: { errorCode: constants.GET_SERVICE_NO_SER_ERR, errorMessage: "No service now for this company." } });
                    }

                } else {
                    res.json({ errorResponse: { errorCode: constants.GET_USER_DETAIL_COMPANY_ERR, errorMessage: "No company exist in database." } });
                }
            }

            function getSysIdServiceNow(accessToken) {
                var serviceURL = serviceDetails.serviceURL + 'api/now/table/sys_user?sysparm_fields=sys_id&sysparm_query=email=' + emailId;
                console.log("serviceURL>>>>>>" + serviceURL);
                var options = {
                    url: serviceURL,
                    method: "GET",
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': accessToken
                    }
                };
                request(options, function (error, response, body) {

                    if (!error && response.statusCode == 200) {

                        console.log("getSysIdServiceNow result has come" + body);
                        try {
                            var userSysId = JSON.parse(body);

                            if (userSysId.result.length == 1) {

                                console.log("userSysId.result[0].sys_id" + userSysId.result[0].sys_id);
                                getOpenTickets(accessToken, userSysId.result[0].sys_id);
                            } else {
                                res.json({ Open_Tickets: [], errorCode: constants.GET_SELF_SUPP_ERR, errorMessage: "Provided emailId not avaliable in Servicenow user table. Please contact admin." });
                            }
                        } catch (error) {
                            res.json({ errorCode: constants.GET_SELF_SUPP_ERR, errorMessage: "Servicenow is sleeping. Please ask your admin to awake servicenow." });
                        }
                    } else {

                        console.log("error reslt has come");
                        //res.json({output: error, resp: response.statusCode});
                        createAccessToken();
                    }
                });
            }


            function getOpenTickets(accessToken, userSysId) {
                var serviceURL = serviceDetails.serviceURL + 'api/now/table/incident?sysparm_fields=state,number,short_description,description,sys_updated_on,assigned_to&sysparm_query=state=2';
                console.log("serviceURL>>>>>>" + serviceURL);
                var options = {
                    url: serviceURL,
                    method: "GET",
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': accessToken
                    }
                };
                request(options, function (error, response, body) {

                    if (!error && response.statusCode == 200) {

                        console.log("result has come" + body);
                        var allOpenTickets = JSON.parse(body);
                        if (allOpenTickets.result.length !== 0) {

                            extractOpenTicket(allOpenTickets.result, userSysId, function (openTickets) {

                                res.json({ Open_Tickets: openTickets, serviceType: "serviceNow" });
                            });

                        } else {

                        }

                    } else {

                        console.log("error reslt has come");
                        //res.json({output: error, resp: response.statusCode});
                        createAccessToken();
                    }
                });
            }

            function extractOpenTicket(allOpenTickets, userSysId, callbackFunction) {

                for (var index = 0; index < allOpenTickets.length; index++) {

                    if (allOpenTickets[index].assigned_to.value == userSysId) {

                        var userData = {
                            "Status": "In Progress",
                            "Description": allOpenTickets[index].description,
                            "LastUpdateTime": allOpenTickets[index].sys_updated_on,
                            "Id": allOpenTickets[index].number,
                            "DisplayLabel": allOpenTickets[index].short_description

                        };
                        openTickets.push(userData);
                    }
                }
                callbackFunction(openTickets);
            }

            function createAccessToken() {
                if (serviceDetails.refreshToken !== "") {
                    authData = {
                        'grant_type': "refresh_token",
                        'client_id': serviceDetails.clientId,
                        'client_secret': serviceDetails.clientSecret,
                        'refresh_token': serviceDetails.refreshToken
                    }
                } else {
                    authData = {
                        'grant_type': "password",
                        'client_id': serviceDetails.clientId,
                        'client_secret': serviceDetails.clientSecret,
                        'username': serviceDetails.userName,
                        'password': serviceDetails.password
                    }
                }

                console.log("authData>>>>>>" + authData);
                var serviceAuthURL = serviceDetails.serviceURL + 'oauth_token.do';
                console.log("serviceURL>>>>>>" + serviceAuthURL);

                var loginOptions = {
                    url: serviceAuthURL,
                    method: "POST",
                    headers: {
                        'User-Agent': 'Super Agent/0.0.1',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    form: authData
                };
                request(loginOptions, function (error1, response1, body1) {

                    if (!error1 && response1.statusCode == 200) {

                        console.log("login result has come");
                        console.log("body>>" + body1);
                        //res.json({output: error1, resp: response1.statusCode});
                        try {
                            var authResponse = JSON.parse(body1);
                            if (authResponse.hasOwnProperty('access_token') && authResponse.hasOwnProperty('refresh_token') && authResponse.hasOwnProperty('token_type')) {

                                serviceDetails.tokenType = authResponse.token_type;
                                serviceDetails.refreshToken = authResponse.refresh_token;
                                serviceDetails.accessToken = authResponse.access_token;
                                allFields.selfSupport.tickets = serviceDetails;
                                console.log("allFields>>>>>>" + JSON.stringify(allFields));
                                console.log("serviceUniqueId>>>>>>" + serviceUniqueId);

                                var updateOption = {
                                    "act": "update",
                                    "guid": serviceUniqueId,
                                    "type": constants.COMPANY_TABLE,
                                    "fields": allFields
                                };
                                $fh.db(updateOption, function (err, data) {
                                    if (err) {

                                        handleError(err, data);
                                    } else {

                                        console.log("Updated data>>>>>" + JSON.stringify(data));
                                        getSysIdServiceNow(authResponse.token_type + " " + authResponse.access_token);
                                    }
                                });

                            } else {
                                res.json({ error: error1, errorResponse: body1 });
                            }
                        } catch (error) {
                            res.json({ errorCode: constants.GET_SELF_SUPP_ERR, errorMessage: "Servicenow is sleeping. Please ask your admin to awake servicenow." });
                        }

                    } else {
                        console.log("login error reslt has come");
                        res.json({ error: error1, errorResponse: response1.statusCode });
                    }
                });
            }

            function getOpenServiceAnyWhereTickets(cookieId) {

                var options = {
                    url: serviceURL,
                    headers: {
                        'cookie': 'LWSSO_COOKIE_KEY=' + cookieId
                    }
                };
                request(options, function (error, response, body) {

                    if (!error && response.statusCode == 200) {
                        console.log("result has come" + body);
                        var response = [];
                        var responseObject;
                        var infoResponse = JSON.parse(body);
                        if (typeof infoResponse !== "undefined" && infoResponse != null) {

                            if ("entities" in infoResponse) {

                                for (var index = 0; index < infoResponse.entities.length; index++) {

                                    responseObject = JSON.parse(JSON.stringify(infoResponse.entities[index].properties).replace(/<p>/g, '').replace(/<\/p>/g, ''));
                                    response.push(responseObject);
                                }
                            }
                        }
                        res.json({Open_Tickets: response, serviceType: "serviceAnyWhere" });
                    } else {

                        console.log("error reslt has come");
                        serviceAnyWhereLogin();
                    }
                });
            }

            function serviceAnyWhereLogin() {
                var loginOptions = {
                    url: serviceDetails.serviceURL + 'auth/authentication-endpoint/authenticate/login',
                    method: "POST",
                    json: {
                        "Login": serviceDetails.userName,
                        "Password": serviceDetails.password
                    }
                };
                request(loginOptions, function (error1, response1, body1) {

                    console.log("coming inside serviceAnyWhereLogin");
                    if (!error1 && response1.statusCode == 200) {
                        console.log("login result has come");
                        console.log("body>>" + body1);

                        serviceDetails.cookie = body1;
                        allFields.selfSupport.tickets = serviceDetails;
                        console.log("allFields>>>>>>" + JSON.stringify(allFields));
                        var updateOption = {
                            "act": "update",
                            "guid": serviceUniqueId,
                            "type": constants.COMPANY_TABLE,
                            "fields": allFields
                        };
                        $fh.db(updateOption, function (err, data) {

                            if (err) {
                                handleError(err, data);
                            } else {

                                console.log("Updated data>>>>>" + JSON.stringify(data));
                                getOpenServiceAnyWhereTickets(body1);
                            }
                        });

                    } else {
                        console.log("login error reslt has come");
                        res.json({ error: error1, errorResponse: response1.statusCode, errorMessage: "Login failed."});
                    }
                });
            }
        });
    });
    return serviceNow;
}
module.exports = serviceNowRoute;