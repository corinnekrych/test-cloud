var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require("fh-mbaas-api");
var constants = require('./constants.js');

function createCompanyRoute() {
    var createCompany = new express.Router();
    createCompany.use(cors());
    createCompany.use(bodyParser());
    createCompany.use(bodyParser.urlencoded());
    createCompany.use(bodyParser.json());

    function handleError(err, response) {
        var error = {
            "message": err,
            "code": 500
        };
        response.writeHead(500);
        response.end(JSON.stringify(error));
    }
    // GET REST endpoint - query params may or may not be populated
    createCompany.post('/', function (req, res) {

        var companyName = req.param('companyName');
        var config_U0 = req.param('config_U0');
        var config_U1 = req.param('config_U1');
        var resetPasswordUrl = req.param('resetPasswordUrl');
        var langSupported = req.param('langSupported');
        var domain = req.param('domain');
        var selfSupport = req.param('selfSupport');
        var companyLogo = req.param('companyLogo');
        var highestCompId = [];
        var companyNameOption = {
            "act": "list",
            "type": constants.COMPANY_TABLE,
            "fields": ["companyName", "domain"]
        };
        $fh.db(companyNameOption, function (err, companyNameData) {
            if (err) {
                handleError(err, res);
            } else {

                var listCompanyName = companyNameData.list.map(function (a) { return a.fields.companyName; });
                var listDomain = companyNameData.list.map(function (a) { return a.fields.domain; });
                console.log("listCompanyName>>>>" + listCompanyName + "   listDomain>>>>" + listDomain);

                if (listCompanyName.indexOf(companyName) > -1) {

                    res.json({ errorResponse: { errorCode: constants.CRT_CMP_NAME_AVAL_ERR, errorMessage: "Company Name is already available." } });
                } else if (listDomain.indexOf(domain) > -1) {

                    res.json({ errorResponse: { errorCode: constants.CRT_CMP_NAME_AVAL_ERR, errorMessage: "Domain is already available." } });
                } else {
                    var readOptions = {
                        "act": "list",
                        "type": constants.COMPANY_TABLE,
                        "fields": ["companyId"]
                    };

                    $fh.db(readOptions, function (err, result) {
                        if (err) {
                            handleError(err, res);
                        } else {
                            console.log("company result", result);
                            var compIdList = [];
                            //for (var eachObj in result.list) {
                            for (var index = 0; index < result.list.length; index++) {

                                compIdList.push(parseInt(result.list[index].fields.companyId, 10));
                            }
                            if (compIdList.length != 0) {
                                highestCompId = compIdList.sort(function (a, b) { return b - a });
                            } else {
                                highestCompId.push(0);
                            }
                            console.log("Get the list of companyIds", highestCompId);
                            console.log("next id", highestCompId[0] + 1);
                            var createOptions = {
                                "act": "create",
                                "type": constants.COMPANY_TABLE,
                                "fields": {
                                    "companyName": companyName,
                                    "config_U0": config_U0,
                                    "config_U1": config_U1,
                                    "resetPasswordUrl": resetPasswordUrl,
                                    "langSupported": langSupported,
                                    "selfSupport": selfSupport,
                                    "domain": domain,
                                    "companyLogo":companyLogo,
                                    "companyId": highestCompId[0] + 1
                                }
                            };
                            $fh.db(createOptions, function (err, result) {
                                if (err) {
                                    handleError(err, res);
                                } else {
                                    res.json({ successCode: constants.CREATE_COMPANY_SUC, successMessage: "Created successfully.", companyId: highestCompId[0] + 1 });
                                }
                            });
                        }
                    });
                }
            }
        });

    });
    return createCompany;
}
module.exports = createCompanyRoute;


