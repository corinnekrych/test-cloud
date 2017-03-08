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
            var wcUniqueId = req.param('wcUniqueId'); 
            console.log("record uniqueId :", wcUniqueId);
            var readOptions = { 
                    "act": "read",
                    "type": constants.SUPPORT_SPOTLOCATION_TABLE,
                    "guid": wcUniqueId
            };
            $fh.db(readOptions, function(err, fetchedRecord) {
              if(err) {
                  handleError(err, res);
              } else {
                  var entityFields = fetchedRecord.fields;
                  entityFields.companyId = compId;
                  entityFields.supportSpotType = supportSpotType;
                  entityFields.latitude = latitude;
                  entityFields.longitude = longitude;
                  entityFields.addressField1 = addressField1;
                  entityFields.addressField2 = addressField2;
                  entityFields.state = state;
                  entityFields.zipCode = zipCode;
                  entityFields.countryCode = countryCode;
                  entityFields.isMeridianExist = isMeridianExist;
                  entityFields.centerTitle = centerTitle;
                  entityFields.serviceDetails = serviceDetails;
                  entityFields.serviceHour = serviceHour;

            var updateOptions = {
              "act": "update",
              "type": constants.SUPPORT_SPOTLOCATION_TABLE,
              "guid": wcUniqueId,
              "fields": entityFields
          };
          $fh.db(updateOptions, function(err, updateData) {
                  if(err) {
                    handleError(err, res);
                  } else { 
                    if (updateData) {
                        res.json({updateResponse:{message: "Updated Successfully!!!.", successCode: constants.UPDATE_WALTIN_SEC}});
                    } else {
                        res.json({errorResponse:{errorCode: constants.UPDATE_WALTIN_ERR, errorMessage: "Some problem in updating walk in center"}});
                    }   
                  }
                });
          
  }
    });
      });
      return supportLocations;
    }
module.exports = supportLocationsRoute;


