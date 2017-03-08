var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require("fh-mbaas-api");
var constants = require('./constants.js');

    function deleteMaintenanceMessageRoute() {
     
      
      var deleteMaintenanceMessage = new express.Router();
      deleteMaintenanceMessage.use(cors());
      deleteMaintenanceMessage.use(bodyParser());
      deleteMaintenanceMessage.use(bodyParser.urlencoded());
      deleteMaintenanceMessage.use(bodyParser.json());

       
        // GET REST endpoint - query params may or may not be populated
        deleteMaintenanceMessage.delete('/', function(req, res) {
          
            var serviceId = req.param('serviceId'); 
            var incrDeleteCount = 0;
            var deleteErrorCount = 0;
            
            console.log("serviceId>>>"+JSON.stringify(serviceId));
            for(var index = 0; index < serviceId.length; index++){
              console.log("serviceId[index]>>>"+serviceId[index]);
              deleteRecord(serviceId[index],function(){
                if(incrDeleteCount + deleteErrorCount === serviceId.length ) {
                  
                    res.json({ message: "Number of records deleted successfully: " + incrDeleteCount + " Number of records Failed to delete : " + deleteErrorCount});
                }
              });
            }
            
        function deleteRecord(serviceId,callback){
          var deleteOptions = { 
                    "act": "delete",
                    "type": constants.MAINTENANCE_MSG_TABLE,
                    "guid": serviceId
            };
            $fh.db(deleteOptions, function(err, deletedRecord) {
              if(err) {
                 deleteErrorCount++;
                 callback();
              } else{
                incrDeleteCount++;
                callback();
              }
          });
        }
            
      });
      
      
      return deleteMaintenanceMessage;
    }
module.exports = deleteMaintenanceMessageRoute;


