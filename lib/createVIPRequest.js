        var express = require('express');
        var bodyParser = require('body-parser');
        var cors = require('cors');
        var $fh = require("fh-mbaas-api");
        var constants = require('./constants.js');

            function createVIPRoute() {
              var vipReq = new express.Router();
              vipReq.use(cors());
              vipReq.use(bodyParser());
              vipReq.use(bodyParser.urlencoded());
              vipReq.use(bodyParser.json());

                function handleError(err, response) {
                    var error = {
                        "message": err,
                        "code": 500
                    };
                    response.writeHead(500);
                    response.end(JSON.stringify(error));
                }
                //PUT REST endpoint - query params may or may not be populated
                vipReq.post('/', function(req, response) {
                var email = req.body.emailId;
                var phoneNum = req.body.phoneNumber;
                var companyId = req.body.companyId;
                var latitude = req.body.latitude;
                var longitude = req.body.longitude;
                var serviceType = req.body.serviceType;
                var techId = req.body.techId;
                var techName = req.body.techName;
                var userName =req.body.userName;
                var createdDate =req.body.createdDate;

                var serviceName, options;
                if (serviceType == "C") {
                    serviceName = 'callback';
                    options = {
                      "act": "create",
                      "type": "IS_VIPRequest",
                      "fields": {
                        "companyId": companyId,
                        "userName": userName,
                        "emailId": email,
                        "status": "open",
                        "date": createdDate,
                        "phoneNum": phoneNum,
                        "serviceType": serviceType,
                        "assigneeTechId": techId,
                        "techName": techName
                      }
                    };
            } else {
                serviceName = 'visit';
                options = {
                  "act": "create",
                  "type": "IS_VIPRequest",
                  "fields": {
                    "companyId": companyId,
                    "userName": userName,
                    "emailId": email,
                    "status": "open",
                    "date": createdDate,
                    "serviceType": serviceType,
                    "assigneeTechId": techId,
                    "techName": techName,
                    "latitude": latitude,
                    "longitude": longitude
                  }
                };
            }
            var searhOptions = {
                "act": "list",
                "type": "IS_VIPRequest",
                "eq": {
                "emailId": email,
                "status": "open",
                "serviceType": serviceType,
                "companyId": companyId
                }
             };
             //Check if any pending request exist for the user...
            $fh.db(searhOptions, function (err, data) {
              if (err) {
                  console.error("Error " + err);
                   handleError(err, res);
              } else if (data.count == 1) {
                    response.json({errorResponse:{errorCode: constants.CREATE_CB_REQ_THERE_ERR, mesage: "You have one request open."}});
              } else {
              console.log('request parameter',options);
              //It creates a new request if there is no pending request for this user.
              $fh.db(options, function (err, data) {
              if (err) {
                  console.error("Error " + err);
                  handleError(err, res);
              } else {
                console.log(JSON.stringify(data));
                var message = { 
                  'alert': userName + ' request a ' + serviceName,
                  'userData': {reqDetails:{uniqueId: data.guid, status: "open", mesage: "Request created successfully.", attributes: data.fields}}
                };
                var options = {
                       broadcast: false, // when true, message will be send to all client apps in the project
                       apps: ['j3hwv6jn5odgbnevowvp4neb', 'j3hwv6pfa5rtm73a563rr3vw'], // or you can specify list of client apps to send notification to
                       criteria: {
                           alias: [techId] //Here is the alias.
                       }
                };
                console.log('Push message:', options);
                $fh.push(message, options, function (err, res) {
                    if (err) {
                        console.log('error:' + err.toString());
                    } else {
                        console.log("status from Unified Push : " + res);
                        response.json({reqDetails:{uniqueId: data.guid, status: "open", mesage: "Request created successfully.", attributes: data.fields}});
                    }
                });
            }
          });
         }
      });
    });
    return vipReq;
}
module.exports = createVIPRoute;