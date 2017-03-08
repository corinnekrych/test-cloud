        var express = require('express');
        var bodyParser = require('body-parser');
        var cors = require('cors');
        var $fh = require("fh-mbaas-api");
        var constants = require('./constants.js');

        function callITSupportRoute() {
            var callITSupport = new express.Router();
              callITSupport.use(cors());
              callITSupport.use(bodyParser());
              callITSupport.use(bodyParser.urlencoded());
              callITSupport.use(bodyParser.json());

          function handleError(err, response) {
                    var error = {
                        "message": err,
                        "code": 500
                    };
                    response.writeHead(500);
                    response.end(JSON.stringify(error));
            }
        //GET REST endpoint - query params may or may not be populated
        callITSupport.post('/', function(req, res) {
             
                var callServiceId = req.param('callServiceId');
                var startTimeInUTC = req.param('startTimeInUTC');
                var endTimeInUTC = req.param('endTimeInUTC');
                var serviceDaysPerWeek = req.param('serviceDaysPerWeek');
                var callConfig = req.param('config');

                var options = {
                    "act": "read",
                    "type": constants.CALL_IT_SUPPORT_TABLE,
                    "guid": callServiceId,
                };
                  $fh.db(options, function(err, callITSupportData) {
                  if(err) {
                    handleError(err, res);
                  } else {
                      if (callITSupportData.count == 1) {
                        var allFields = callITSupportData.fields;
                        allFields.startTimeInUTC = startTimeInUTC;
                        allFields.serviceDaysPerWeek = serviceDaysPerWeek;
                        allFields.config = callConfig;
                        allFields.endTimeInUTC = endTimeInUTC;
                        var createOption = {
                          "act": "update",
                          "guid": callServiceId,
                          "type": constants.CALL_IT_SUPPORT_TABLE,
                          "fields": allFields
                        };
                        $fh.db(createOption, function (err, data) {
                          if (err) {
                           console.error("Error " + err);
                          } else {
                              res.json({successResponse:{successCode: constants.UPDATE_CALL_SER_SUC, successMessage: "Call IT Support updated successfully."}});
                          }
                        });
                      } else {
                         res.json({errorResponse:{errorCode: constants.UPDATE_CALL_SER_ERR, errorMessage: "Call IT Support is not able update."}});
                      }
                    }
                });
            });
          return callITSupport;
        }
  module.exports = callITSupportRoute;