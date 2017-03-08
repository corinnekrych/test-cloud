    var express = require('express');
    var bodyParser = require('body-parser');
    var cors = require('cors');
    var $fh = require("fh-mbaas-api");

        function ticketsRoute() {
          var tickets = new express.Router();
          tickets.use(cors());
          tickets.use(bodyParser());
          tickets.use(bodyParser.urlencoded());
          tickets.use(bodyParser.json());

          function handleError(err, response) {
            var error = {
                 "message": err,
                  "code": 500
            };
            response.writeHead(500);
            response.end(JSON.stringify(error));
          }
          //PUT REST endpoint - query params may or may not be populated
          tickets.get('/', function(req, response) {
            var companyId = req.param('companyId');
            var compNumId = parseInt(req.param('companyId'), 10);
            var assigneeTechId = req.param('assigneeTechId');
            var options = {
                "act": "list",
                "type": "IS_VIPRequest",
                "eq": {
                "assigneeTechId": assigneeTechId,
                "status": "open"
                },
                "in": {
                  "companyId": [companyId, compNumId]
                }               
             };
            $fh.db(options, function (err, data) {
              if (err) {
                  console.error("Error " + err);
                   handleError(err, res);
              } else {
                var allRequests = [];
                for (var index = 0; index < data.list.length; index++) {
                      var eachElement = data.list[index].fields;
                      eachElement.uniqueId = data.list[index].guid;
                       allRequests.push(eachElement);
                }
                response.json({reqDetails:{requests: allRequests, numberOfPendingRequests: data.count}});
              }
            });
        });
    return tickets;
}
module.exports = ticketsRoute;