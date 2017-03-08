var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require("fh-mbaas-api");
var constants = require('./constants.js');

    function deleteCompanyRoute() {
      var deleteCompany = new express.Router();
      deleteCompany.use(cors());
      deleteCompany.use(bodyParser());
      deleteCompany.use(bodyParser.urlencoded());
      deleteCompany.use(bodyParser.json());

        function handleError(err, response){
            var error = {
                "message": err,
                "code": 500
            };
            response.writeHead(500);
            response.end(JSON.stringify(error));
        }
        // GET REST endpoint - query params may or may not be populated
        deleteCompany.post('/', function(req, res) {

            var compId = req.param('companyId');
            var companyId = parseInt(compId, 10);
            var tableNames = [constants.USER_TABLE,constants.CALL_IT_SUPPORT_TABLE,constants.CHAT_IT_SUPPORT_TABLE,constants.SUPPORT_SPOTLOCATION_TABLE, 
            constants.TECHNICIAN_TABLE, constants.CALLBACK_REQUEST_TABLE,constants.VIP_REQUEST_TABLE];
            var options = {
                    "act": "list",
                    "type": constants.COMPANY_TABLE,
                    "in": {
                           "companyId": [companyId, compId]
                          }
                };
                $fh.db(options, function(err, deleteCompanyData) {
                  if(err) {
                    handleError(err, res);
                  } else {
                    if(deleteCompanyData.count == 1){
                      var deleteCompany=0;
                      for(var deleteTable = 0; deleteTable <= 6; deleteTable++){
                        deleteCompanyFromTable(tableNames[deleteCompany],function(){
                          
                        });
                      }
                      deleteRow(constants.USER_TABLE, deleteCompanyData.list[0].guid,function(){
                           res.json({successResponse:{successCode: constants.DELETE_COMPANY_SUC, successMessage: "Deleted company successfully."}});  
                      });
                    }
                  }
                });
                
            
            function deleteCompanyFromTable(tableName,callbackfunction){   
              var options = {
                    "act": "list",
                    "type": tableName,
                    "in": {
                           "companyId": [companyId, compId]
                          }
                };
                $fh.db(options, function(err, deleteData) {
                  if(err) {
                    handleError(err, res);
                  } else {
                      if(typeof deleteData.length !== 0){
                        var deleteTable = 0;
                        for(companyId in deleteData){
                          deleteRow(tableName, deleteData.list[deleteTable].guid,function(){
                            deleteTable++;
                          });
                        }
                        callbackfunction();
                      }
                      callbackfunction();
                    }
                });
            }
            
            function deleteRow(tableName,serviceId,callbackfunction){
             var deleteOptions = { 
                    "act": "delete",
                    "type": tableName,
                    "guid": serviceId
              };
              $fh.db(deleteOptions, function(err, deletedRecord) {
                if(err) {
                  handleError(err, res);
                } else {
                  callbackfunction();
                }
              });
            }
      });
      return deleteCompany;
    }
module.exports = deleteCompanyRoute;