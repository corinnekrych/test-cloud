        var express = require('express');
        var bodyParser = require('body-parser');
        var cors = require('cors');
        var $fh = require("fh-mbaas-api");
        var soap = require('soap');
        var constants = require('./constants.js');

            function cancelCallBackRoute() {
              var canelCallBackReq = new express.Router();
              canelCallBackReq.use(cors());
              canelCallBackReq.use(bodyParser());
              canelCallBackReq.use(bodyParser.urlencoded());
              canelCallBackReq.use(bodyParser.json());

                function handleError(err, response) {
                    var error = {
                        "message": err,
                        "code": 500
                    };
                    response.writeHead(500);
                    response.end(JSON.stringify(error));
                }
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
                // GET REST endpoint - query params may or may not be populated
                canelCallBackReq.post('/', function(req, response) {
                var serviceUrl = req.body.cbaAddress;
                var uniqueId = req.body.uniqueId;
                var requestId = req.body.requestId;

                console.log('Call back url.', serviceUrl);
                decryptAvayacredentials(function(err, plainUserName,plainPassowrd){
                  if(!err){
                    soap.createClient(serviceUrl, function(err, client) {
                      if(err){
                        console.log("error in creating client");
                      }
                      var soapHeader = {
                        "Security": {
                          "mustUnderstand": "1",
                          "UsernameToken": {
                            "Id": "299050C4F0DFC7E7E414533635280675",
                            "Username": plainUserName,
                            "Password": plainPassowrd
                          }
                        }
                      };
                      client.addSoapHeader(soapHeader, '', 'tns', 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd', 'http://model.webcallback.callback.csi.avaya.com', 'http://exceptions.webcallback.callback.csi.avaya.com');
                      var params = {
                        "tns:cancelCriteria": {
                            // "ns0:callbackConfigurationId": callQueueId,
                            // "ns0:phoneNumber": phoneNumber
                            "ns0:requestId": requestId
                        }
                      }; 
                      client.cancelCallbackRequest(params, function(err, result) {
                      console.log('last request:', client.lastRequest);
                      console.log('Req placing arguments for cancel!!!', params);
                      if (err) {
                        handleError(err, response);
                        console.log('error in cancelling call request.');
                      } else {
                        console.log('Cancelled call back request successfully.');
                        var options = {
                          "act": "read",
                          "type": constants.CALLBACK_REQUEST_TABLE,
                          "guid": uniqueId
                        };
                        $fh.db(options, function (err, entity) {
                          if (err) {
                            console.error("Error " + err);
                            handleError(err, res);
                          } else {
                              var entFields = entity.fields;
                              entFields.status = 'Cancelled';
                              var updateOptions = {
                                  "act": "update",
                                  "type": constants.CALLBACK_REQUEST_TABLE,
                                  "guid": uniqueId,
                                  "fields": entFields
                              };
                            $fh.db(updateOptions, function (err, data) {
                                if (err) {
                                      console.error("Error " + err);
                                } else {
                                  console.log('cancel request result', data);
                                  response.json({callBackReqDetails:{message:"Request cancelled Successfully", requestId: requestId, status: "cancelled", uniqueId: uniqueId}});
                               }
                            });
                          }
                        });
                    }
                });
             });
            }else{
                 response.json({errorResponse:{errorCode: constants.DECRYPT_CREDENTIAL_ERR, mesage: "We are unable to process your request right now. Unable to decrypt username and password."}});   
            }
        });
    });
    return canelCallBackReq;
}
module.exports = cancelCallBackRoute;