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
        maintenanceMessage.get('/', function(req, res) {
          
          var compId = req.param('companyId');
          var region = req.param('countryCode');
          var companyId = parseInt(compId, 10);
          var options = {
            "act": "list",
            "type": constants.MAINTENANCE_MSG_TABLE,
            "eq": {
                "region": region
            },
            "in": {
              "companyId": [companyId, compId],
              "status": ["1", 1]
            }
        };
          $fh.db(options, function(err, maintenanceMessageData) {
          if(err){
            handleError(err, res);
          } else {
            console.log("maintenanceMessageData>>>>"+JSON.stringify(maintenanceMessageData));
            var allmaintenanceMessage = [];
            for (var index = 0; index < maintenanceMessageData.list.length; index++) {
                var eachElement = {companyId : maintenanceMessageData.list[index].fields.companyId , status : maintenanceMessageData.list[index].fields.status , 
                lang : maintenanceMessageData.list[index].fields.lang , messageId : maintenanceMessageData.list[index].fields.messageId , region : maintenanceMessageData.list[index].fields.region ,
                location : maintenanceMessageData.list[index].fields.location ,title : maintenanceMessageData.list[index].fields.title , createdDate : maintenanceMessageData.list[index].fields.createdDate ,
                Description : maintenanceMessageData.list[index].fields.Description , outageType : maintenanceMessageData.list[index].fields.outageType , uniqueId : maintenanceMessageData.list[index].guid};
                if(maintenanceMessageData.list[index].fields.expiryType == 2){
                  eachElement['expireTime'] = maintenanceMessageData.list[index].fields.expireTime;
                }
                allmaintenanceMessage.push(eachElement);
            }
            res.json({maintenanceMessage: allmaintenanceMessage});
          }
        });
      });
      return maintenanceMessage;
    }
module.exports = maintenanceMessageRoute;