        var express = require('express');
        var bodyParser = require('body-parser');
        var cors = require('cors');
        var $fh = require("fh-mbaas-api");

            function cancelVIPRoute() {
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
                var serviceId = req.body.serviceId;
                var emailId = req.body.emailId;
                var companyId = req.body.companyId;
                var techId = req.body.techId;

                var options = {
                          "act": "read",
                          "type": "IS_VIPRequest",
                          "guid": serviceId
                      };
                      $fh.db(options, function (err, entity) {
                        if (err) {
                            console.error("Error " + err);
                            handleError(err, res);
                        } else {
                              var entFields = entity.fields;
                              entFields.status = 'Cancelled';
                              var updateOptions = {
                                  "act": "update",
                                  "type": "IS_VIPRequest",
                                  "guid": serviceId,
                                  "fields": entFields
                              };
                         $fh.db(updateOptions, function (err, data) {
                                if (err) {
                                      console.error("Error " + err);
                                      handleError(err, res);
                                } else {
                                  var serviceMessage;
                                  if (entFields == "C") {
                                      serviceMessage = 'call back';
                                  } else {
                                      serviceMessage = 'visit';
                                  }
                                      var message = { 
                                          'alert': entFields.userName + ' cancelled ' + serviceMessage,
                                          'userData': {cancelDetails: {requestId: serviceId, message: "Request cancelled successfully."}}
                                      };
                                      
                                      var options = {
                                          broadcast: false, // when true, message will be send to all client apps in the project
                                          apps: ['j3hwv6jn5odgbnevowvp4neb', 'j3hwv6pfa5rtm73a563rr3vw'], // or you can specify list of client apps to send notification to
                                          criteria: {
                                              alias: [techId] //Here is the alias.
                                          }
                                      };
                                      $fh.push(message, options, function (err, res) {
                                          if (err) {
                                              console.log('error:' + err.toString());
                                              handleError(err, res);
                                          } else {
                                              console.log("status from Unified Push : " + res);
                                              response.json({reqDetails:{status: "Cancelled", mesage: "Request cancelled successfully."}});
                                          }
                                      });
                               }
                                response.json({reqDetails:{status: "Cancelled", mesage: "Request cancelled successfully."}});
                          });
                        }
                    });
    });
    return vipReq;
}
module.exports = cancelVIPRoute;