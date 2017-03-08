    var bodyParser = require('body-parser');
    var cors = require('cors');
    var $fh = require("fh-mbaas-api");
        
        function cancelVIPRoute() {
            var vipReq = new express.Router();
            vipReq.use(cors());
            vipReq.use(bodyParser());
            vipReq.use(bodyParser.urlencoded());
            vipReq.use(bodyParser.json());

            function handleError(err, response) {
               var error = {
                  "message": err,
                  "code": 500
               };
               response.writeHead(500);
               response.end(JSON.stringify(error));
            }
            //PUT REST endpoint - query params may or may not be populated
            vipReq.post('/', function(req, response) {
               var serviceIds = req.body.serviceIds.split(',');
               var emailId = req.body.emailId;
               var companyId = req.body.companyId;
               var techId = req.body.techId;

              var options = {
                   "act": "read",
                   "type": "IS_VIPRequest",
                   "guid": serviceId
             };
             $fh.db(options, function (err, entity) {
                if (err) {
                   console.error("Error " + err);
                   handleError(err, res);
                } else {
                  var entFields = entity.fields;
                  entFields.status = 'Closed';
                  var updateOptions = {
                  "act": "update",
                  "type": "IS_VIPRequest",
                  "guid": serviceId,
                  "fields": entFields
               };
               $fh.db(updateOptions, function (err, data) {
                  if (err) {
                     console.error("Error " + err);
                     handleError(err, res);
                  } else {
                    response.json({reqDetails:{status: "Closed", mesage: "Request closed successfully."}});
                 }
            });
          }
       });
    });
    return vipReq;
    }
    module.exports = cancelVIPRoute;