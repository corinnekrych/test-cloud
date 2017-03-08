        var express = require('express');
        var bodyParser = require('body-parser');
        var cors = require('cors');
        var $fh = require("fh-mbaas-api");
        var constants = require('./constants.js');

            function updateTechRoute() {
              var updateTech = new express.Router();
              updateTech.use(cors());
              updateTech.use(bodyParser());
              updateTech.use(bodyParser.urlencoded());
              updateTech.use(bodyParser.json());

              function handleError(err, response) {
                    var error = {
                        "message": err,
                        "code": 500
                    };
                    response.writeHead(500);
                    response.end(JSON.stringify(error));
                }
                //POST REST endpoint - query params may or may not be populated
                updateTech.post('/', function(req, res) {

                var compId = req.body.companyId;
                var emailId = req.body.emailId;
                var companyNumId = parseInt(compId, 10);
                console.log("compId>>>>>>>>>>"+compId+">>>>>>>>>emailId>>>>>>>>>>>>"+emailId);
                var options = {
                    "act": "list",
                    "type": constants.TECHNICIAN_TABLE,
                    "eq": {
                      "userId": emailId
                    }, 
                    "in": {
                      "companyId": [compId, companyNumId]
                    }
                };
                $fh.db(options, function (err, entityObj) {
                console.log("entityObj"+JSON.stringify(entityObj));
                  if (err) {
                      console.error("Error " + err);
                      handleError(err, res);
                  } else {
                    
                    var entFields = entityObj.list[0].fields;
                    entFields.status = "2";
                    var updateOptions = {
                        "act": "update",
                        "type": "IS_Technician",
                        "guid": entityObj.list[0].guid,
                        "fields": entFields
                    };
                    $fh.db(updateOptions, function (err, data) {
                        if (err) {
                            console.error("Error " + err);
                            handleError(err, res);
                       } else {
                          res.json({techStatus: "status updated successfully.", statusCode: constants.UPDATE_TECH_STATUS});
                      }
                  });
                }
              });
            });
        return updateTech;
        }
        module.exports = updateTechRoute;