var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require("fh-mbaas-api");
var constants = require('./constants.js');

    function deleteCallServiceRoute() {
     
      
      var deleteCallService = new express.Router();
      deleteCallService.use(cors());
      deleteCallService.use(bodyParser());
      deleteCallService.use(bodyParser.urlencoded());
      deleteCallService.use(bodyParser.json());

        function handleError(err, response){
            var error = {
                "message": err,
                "code": 500
            };
            response.writeHead(500);
            response.end(JSON.stringify(error));
        }
        // GET REST endpoint - query params may or may not be populated
        deleteCallService.post('/', function(req, res) {

            var serviceId = req.param('serviceId'); 
            
            var deleteOptions = { 
                    "act": "delete",
                    "type": constants.CALL_IT_SUPPORT_TABLE,
                    "guid": serviceId
            };
            $fh.db(deleteOptions, function(err, deletedRecord) {
              if(err) {
                  handleError(err, res);
              } else {
                  res.json({successCode: constants.DELETE_CALL_SER_SUC, message: "Successfully deleted one record."});
              }
          });
      });
      return deleteCallService;
    }
module.exports = deleteCallServiceRoute;


