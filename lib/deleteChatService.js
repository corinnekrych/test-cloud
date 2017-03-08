var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require("fh-mbaas-api");
var constants = require('./constants.js');

    function deleteChatServiceRoute() {
      var deleteChatService = new express.Router();
      deleteChatService.use(cors());
      deleteChatService.use(bodyParser());
      deleteChatService.use(bodyParser.urlencoded());
      deleteChatService.use(bodyParser.json());

        function handleError(err, response){
            var error = {
                "message": err,
                "code": 500
            };
            response.writeHead(500);
            response.end(JSON.stringify(error));
        }
        // GET REST endpoint - query params may or may not be populated
        deleteChatService.post('/', function(req, res) {

            var serviceId = req.param('serviceId'); 
            
            var deleteOptions = { 
                    "act": "delete",
                    "type": constants.CHAT_IT_SUPPORT_TABLE,
                    "guid": serviceId
            };
            $fh.db(deleteOptions, function(err, deletedRecord) {
              if(err) {
                  handleError(err, res);
              } else {
                  res.json({successCode: constants.DELETE_CHAT_SER_SUC, message: "Successfully deleted one record."});
              }
    });
      });
      return deleteChatService;
    }
module.exports = deleteChatServiceRoute;


