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
        supportLocations.get('/', function(req, res) {
        var companyId, countryCode;

            var compId = req.param('companyId');
            countryCode = req.param('countryCode');
            companyId = parseInt(compId, 10);

        var options = {
            "act": "list",
            "type": constants.SUPPORT_SPOTLOCATION_TABLE,
            "eq": {
                "countryCode": countryCode
            },
            "in": {
                 "companyId": [companyId, compId]
            }
        };
          $fh.db(options, function(err, spotData){
          if(err){
            handleError(err, res);
          } else {
              var locations = [];
              if (spotData.count >= 1) {
              for ( index = 0; index < spotData.list.length; index++ ) {
                      locations.push(spotData.list[index].fields);
                  }
                    res.json({spotDetails: locations});
            } else {
                res.json({errorResponse:{errorCode: constants.GET_WALKIN_SUP_NOT_AVAL, errorMessage: "Your company doesn't have any IT Support walk in center facility at this moment."}});
            }   
          }
        });
      });
      return supportLocations;
    }

module.exports = supportLocationsRoute;


