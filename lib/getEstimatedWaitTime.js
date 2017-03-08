var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var $fh = require("fh-mbaas-api");
var constants = require('./constants.js');

    function estimateWaitTimeRoute() {
      var estimateWaitTimeReq = new express.Router();
      estimateWaitTimeReq.use(cors());
      estimateWaitTimeReq.use(bodyParser());
      estimateWaitTimeReq.use(bodyParser.urlencoded());
      estimateWaitTimeReq.use(bodyParser.json());
       
       function decryptAvayacredentials(callBack) {
            var plainUserName;
            $fh.sec({
              "act": 'decrypt',
              "params": {
                  "algorithm": "AES",
                  "ciphertext": constants.AVAYA_USER_NAME,
                  "key": constants.SECRET_KEY,
                  "iv": constants.INITIAL_VECTOR
              }
            }, function (err, result) {
                  if (err) {
                    callBack(err,null,null);
                  }else{
                    plainUserName = result.plaintext;
                  }
          });
          $fh.sec({
              "act": 'decrypt',
              "params": {
                  "algorithm": "AES",
                  "ciphertext": constants.AVAYA_PASSWORD,
                  "key": constants.SECRET_KEY,
                  "iv": constants.INITIAL_VECTOR
              }
            }, function (err, result) {
                  if (err) {
                      callBack(err,null,null);
                  }else{
                    var plainPassowrd = result.plaintext;
                    console.log("UserName>> " + plainUserName + "  and password>>>>>"+plainPassowrd);
                    callBack(null,plainUserName,plainPassowrd);
                  }
          });
        }
        function getEstimatedWaitTime(userName, password, queueId, cbaURL, callBack) {
          
              // var url = "http://16.153.198.39:8081/webcallback/WebCallback418?wsdl";
              var soap = require('soap');
              var url = cbaURL;
              console.log('esimated wait time for uniqueId', queueId);
              soap.createClient(url, function (err, client) {
              if (err) {
                console.log('error in connecting to server- estimated wait time');
                callBack(err, null);
              } else {
              var soapHeader = {
              "Security": {
                "mustUnderstand": "1",
                "UsernameToken": {
                    "Id": "299050C4F0DFC7E7E414533635280675",
                    "Username": userName,
                    "Password": password
                }
            }
        };
      client.addSoapHeader(soapHeader, '', 'tns', 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd');
          var params = {"tns:configurationId":queueId};
            console.log('request papameter is', params);
          client.getExpectedWaitTime(params, function(err, result) {
            console.log('Req placing!!!');
            if (err) {
              console.log('there is some error in request');
                  callBack(err, null);
            } else {
              console.log('Response got!!!');
                  callBack(null, result);
            }
          });
              }
        });
      }
        // GET REST endpoint - query params may or may not be populated
        estimateWaitTimeReq.get('/', function(req, res) {
                var callQueueId = req.param('callQueueId');
                var primaryAddress = req.param('primaryAddress');
                var secondaryAddress = req.param('secondaryAddress');
                var isPrimaryAddressExist;
                var cbaURL;
                console.log("coming inside estimate wait time API");
                if (!(primaryAddress || secondaryAddress)) {
                    res.json({errorResponse: "CBA is missing", errorCode: constants.CREATE_CBA_MISS_ERR});
                }
                if (primaryAddress) {
                  cbaURL = primaryAddress;
                  isPrimaryAddressExist = true;
                } else if (secondaryAddress) {
                  cbaURL = secondaryAddress;
                  isPrimaryAddressExist = false;
                }
                console.log('callQueueId>>>>'+callQueueId);
                decryptAvayacredentials(function(err, plainUserName,plainPassowrd){
                  if(!err){
                      console.log("Username: >>" + plainUserName + " Password: >>>" + plainPassowrd);
                    getEstimatedWaitTime(plainUserName, plainPassowrd, callQueueId, cbaURL, function (err, result) {
                      if(err) { 
                        if(isPrimaryAddressExist && secondaryAddress) {
                          console.log('calling with secondary address.- estimated wait time');
                          getEstimatedWaitTime(plainUserName, plainPassowrd, callQueueId, secondaryAddress, function(secondaryErr, secondaryResult) {
                            if (secondaryErr) {
                              console.log('failed with secondary address.- estimated wait time');
                              res.json({errorResponse: "There is some problem in getting wait time", errorCode: constants.GET_ESTIMATE_ERR});
                            } else {
                              console.log('successful response got with secondary queue',secondaryResult);
                              res.json({estimatedWaitTime: secondaryResult.return, queueid: callQueueId}); 
                            }
                          });
                        } else {
                            res.json({errorResponse: "There is some problem in getting wait time", errorCode: constants.GET_ESTIMATE_ERR});
                        }
                      } else {
                          res.json({estimatedWaitTime: result.return, queueid: callQueueId});
                      }
                    });
                  }else{
                    response.json({errorResponse:{errorCode: constants.DECRYPT_CREDENTIAL_ERR, mesage: "We are unable to process your request right now. Unable to decrypt username and password."}});
                  }
                });
        });
      return estimateWaitTimeReq;
  }
module.exports = estimateWaitTimeRoute;