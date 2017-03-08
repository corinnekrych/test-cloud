var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require("fh-mbaas-api");
var constants = require('./constants.js');

    function selfSupportRoute() {
      var selfSupport = new express.Router();
      selfSupport.use(cors());
      selfSupport.use(bodyParser());
      selfSupport.use(bodyParser.urlencoded());
      selfSupport.use(bodyParser.json());

        function handleError(err, response) {
            var error = {
                "message": err,
                "code": 500
            };
            response.writeHead(500);
            response.end(JSON.stringify(error));
        }
        //GET REST endpoint - query params may or may not be populated
        selfSupport.get('/', function(req, res) {
          
          var compId = req.param('companyId');
          var companyId = parseInt(compId, 10);
          var options = {
            "act": "list",
            "type": constants.COMPANY_TABLE,
            "in": {
              "companyId": [companyId, compId]
            }
        };
          $fh.db(options, function(err,selfSupportData) {
          if(err){
            handleError(err, res);
          } else {
            console.log("selfSupportData>>>>"+JSON.stringify(selfSupportData));
            if(selfSupportData.count == 1){
                if('selfSupport' in selfSupportData.list[0].fields){
                    var selfSupportOptions = [];
                    var availableSelfSupportOptions = selfSupportData.list[0].fields.selfSupport;
                     if(typeof availableSelfSupportOptions!== "undefined"){
                          Object.keys(availableSelfSupportOptions).forEach(function(key) {
                            var eachObject = availableSelfSupportOptions[key];
                            eachObject["requestId"] = key;
                            selfSupportOptions.push(eachObject); 
                          });
                        }
                    res.json({numberOfselfSupportQueue: Object.keys(selfSupportData.list[0].fields.selfSupport).length, selfSupportData: selfSupportOptions});
                }else{
                    res.json({errorCode: constants.GET_SELF_SUPP_ERR, errorMessage: "No Self Support futures for this company."});
                }
            }else{
                res.json({errorCode: constants.GET_SELF_SUPP_NOT_AVAL_ERR, errorMessage: "Company not avaliable."});
            }
          }
        });
      });
      return selfSupport;
    }
module.exports = selfSupportRoute;