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

            var wcUniqueId = req.param('wcUniqueId'); 
            console.log("record uniqueId :", wcUniqueId);
            var deleteOptions = { 
                    "act": "delete",
                    "type": constants.SUPPORT_SPOTLOCATION_TABLE,
                    "guid": wcUniqueId
            };
            $fh.db(deleteOptions, function(err, deletedRecord) {
              if(err) {
                  handleError(err, res);
              } else {
                  res.json({successCode: constants.DELETE_WALKIN_SUC, message: "Successfully deleted one record."});
              }
    });
      });
      return supportLocations;
    }
module.exports = supportLocationsRoute;


