var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require("fh-mbaas-api");

    function techListRoute() {
      var techList = new express.Router();
      techList.use(cors());
      techList.use(bodyParser());
      techList.use(bodyParser.urlencoded());
      techList.use(bodyParser.json());

        function handleError(err, response) {
            var error = {
                "message": err,
                "code": 500
            };
            response.writeHead(500);
            response.end(JSON.stringify(error));
        }
        //GET REST endpoint - query params may or may not be populated
        techList.get('/', function(req, res) {
          
          var email = req.param('emailId');
          var countryCode = req.param('countryCode');
          var companyId = parseInt(req.param('companyId'), 10);
          var options = {
            "act": "list",
            "type": "IS_Technician",
            "eq": {
                "location": countryCode,
                },
            "in": {
              "status": ["2", 2],
              "companyId": [companyId, req.param('companyId')]
            },
            "ne": {
                "userId": email
            }
        };
          $fh.db(options, function(err, techData) {
          if(err){
            handleError(err, res);
          } else {
            var allTechnician = [];
            for (var index = 0; index < techData.list.length; index++) {
                var eachElement = techData.list[index].fields;
                eachElement.uniqueId = techData.list[index].guid;
                allTechnician.push(eachElement);
            }
            res.json({techList: allTechnician});
          }
        });
      });
      return techList;
    }
module.exports = techListRoute;