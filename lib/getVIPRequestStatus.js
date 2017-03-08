        var express = require('express');
        var bodyParser = require('body-parser');
        var cors = require('cors');
        var $fh = require("fh-mbaas-api");

            function VIPRequestStatusRoute() {
              var vipReqStatus = new express.Router();
              vipReqStatus.use(cors());
              vipReqStatus.use(bodyParser());
              vipReqStatus.use(bodyParser.urlencoded());
              vipReqStatus.use(bodyParser.json());

                function handleError(err, response) {
                    var error = {
                        "message": err,
                        "code": 500
                    };
                    response.writeHead(500);
                    response.end(JSON.stringify(error));
                }
                //PUT REST endpoint - query params may or may not be populated
                vipReqStatus.get('/', function(req, response) {
                var companyId = req.param('companyId');
                var compNumId = parseInt(companyId, 10);
                var emailId = req.param('emailId');
                var options = {
                          "act": "list",
                          "type": "IS_VIPRequest",
                          "eq": {
                            "emailId": emailId,
                            "status": "open"
                          },
                          "in": {
                           "companyId": [companyId, compNumId]
                          }
                      };
                      $fh.db(options, function (err, data) {
                          console.log("err of VIP Request>>>"+err+"data>>>>>"+JSON.stringify(data));
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
    return vipReqStatus;
}
module.exports = VIPRequestStatusRoute;