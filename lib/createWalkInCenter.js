var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require("fh-mbaas-api");
var constants = require('./constants.js');

    function supportLocationsRoute() {
      var supportLocations = new express.Router();
      supportLocations.use(cors());
      supportLocations.use(bodyParser());
      supportLocations.use(bodyParser.urlencoded());
      supportLocations.use(bodyParser.json());

        function handleError(err, response){
            var error = {
                "message": err,
                "code": 500
            };
            response.writeHead(500);
            response.end(JSON.stringify(error));
        }

        // GET REST endpoint - query params may or may not be populated
        supportLocations.post('/', function(req, res) {

            var compId = parseInt(req.param('companyId'), 10);
            var countryCode = req.param('countryCode');
            var supportSpotType = req.param('supportSpotType');
            var latitude = req.param('latitude');
            var longitude = req.param('longitude');
            var addressField1 = req.param('addressField1');
            var addressField2 = req.param('addressField2');
            var state = req.param('state');
            var zipCode = req.param('zipCode');
            var serviceDetails = req.param('serviceDetails');
            var isMeridianExist = req.param('isMeridianExist');
            var serviceHour = req.param('serviceHour');
            var centerTitle = req.param('centerTitle');

        var options = {
            "act": "create",
            "type": constants.SUPPORT_SPOTLOCATION_TABLE,
            "fields": {
              "companyId": compId,
              "supportSpotType": supportSpotType,
              "latitude": latitude,
              "longitude": longitude,
              "addressField1": addressField1,
              "addressField2": addressField2,
              "state": state,
              "zipCode": zipCode,
              "countryCode": countryCode,
              "isMeridianExist": isMeridianExist,
              "centerTitle":centerTitle,
              "serviceDetails": serviceDetails,
              "serviceHour": serviceHour
            }
        };
          $fh.db(options, function(err, result){
          if(err){
            handleError(err, res);
          } else {

              res.json({spotDetails: result});
            } 
            // else {
            //     res.json({errorResponse:{errorCode: 100004, errorMessage: "Your company doesn't have any IT Support walk in center facility at this moment."}});
            // }   
          // }
        });
      });
      return supportLocations;
    }
module.exports = supportLocationsRoute;


