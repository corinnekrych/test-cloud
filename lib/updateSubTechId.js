        var express = require('express');
        var bodyParser = require('body-parser');
        var cors = require('cors');
        var $fh = require("fh-mbaas-api");
        var constants = require('./constants.js');

            function updateSubTechIdRoute() {
              var updateSubTechId = new express.Router();
              updateSubTechId.use(cors());
              updateSubTechId.use(bodyParser());
              updateSubTechId.use(bodyParser.urlencoded());
              updateSubTechId.use(bodyParser.json());

              function handleError(err, response) {
                    var error = {
                        "message": err,
                        "code": 500
                    };
                    response.writeHead(500);
                    response.end(JSON.stringify(error));
                }
                //POST REST endpoint - query params may or may not be populated
                updateSubTechId.post('/', function(req, res) {

                var compId = req.body.companyId;
                var emailId = req.body.emailId;
                var substituteTId = req.body.substituteTId;
                var techStatus = req.body.techStatus;
                var companyNumId = parseInt(compId, 10);
                var options = {
                    "act": "list",
                    "type": constants.TECHNICIAN_TABLE, 
                    "in": {
                      "companyId": [compId, companyNumId]
                    }
                };
                $fh.db(options, function (err, entityObj) {
                  if (err) {
                      console.error("Error " + err);
                      handleError(err, res);
                  } else {
                    
                    console.log("entityObj>>>>>"+JSON.stringify(entityObj));
                    var existUserEmailIds = entityObj.list.map(function(a) {return a.fields.userId;});
                    var indexUserEmailId = existUserEmailIds.indexOf(emailId);
                    var indexSubstituteId = existUserEmailIds.indexOf(substituteTId);
                    console.log("     existUserEmailIds>>>>>"+existUserEmailIds +"     indexUserEmailId>>>>>"+indexUserEmailId +"     indexSubstituteId>>>>>"+indexSubstituteId);

                    if(indexUserEmailId > -1) {

                        if(indexSubstituteId > -1) {

                            var entFields = entityObj.list[indexUserEmailId].fields;
                            entFields.substituteTId = substituteTId;
                            entFields.status = techStatus;
                            var updateOptions = {
                                "act": "update",
                                "type": constants.TECHNICIAN_TABLE,
                                "guid": entityObj.list[indexUserEmailId].guid,
                                "fields": entFields
                            };
                            $fh.db(updateOptions, function (err, data) {

                                console.log("entityObj>>>>>"+JSON.stringify(data));
                                if (err) {
                                    console.error("Error " + err);
                                    handleError(err, res);
                                } else {
                                    res.json({successCode: "Substitute Id updated successfully.", statusCode: constants.UPDATE_SUB_ID_SUC});
                                }
                            });
                        } else{

                            res.json({errorCode: constants.UPDATE_SUB_ID_ERR, errorMessage: "Provided Substitute Id is not there in provided company Id."});
                        }
                    } else {

                        res.json({errorCode: constants.UPDATE_SUB_ID_USER_ID_ERR, errorMessage: "Provided User Id is not there in provided company Id."});
                    }
                    
                }
              });
            });
        return updateSubTechId;
        }
        module.exports = updateSubTechIdRoute;