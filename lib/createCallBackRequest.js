        var express = require('express');
        var bodyParser = require('body-parser');
        var cors = require('cors');
        var $fh = require("fh-mbaas-api");
        var soap = require('soap');
        var constants = require('./constants.js');

          function createCallBackRoute() {
              var callBackReq = new express.Router();
              callBackReq.use(cors());
              callBackReq.use(bodyParser());
              callBackReq.use(bodyParser.urlencoded());
              callBackReq.use(bodyParser.json());

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

        function createCallBackRequest(userName, passowrd, queueId, cbaURL, mobileNumber, vdnNum, questionId, callBack) {
          
              // var url = "http://16.153.198.39:8081/webcallback/WebCallback418?wsdl";
              var url = cbaURL;
              console.log('Call back url with uniqueId', queueId);
              console.log("UserName>> " + userName + "  and password>>>>>"+passowrd);
              soap.createClient(url, function (err, client) {
              var soapHeader = {
              "Security": {
                "mustUnderstand": "1",
                "UsernameToken": {
                    "Id": "299050C4F0DFC7E7E414533635280675",
                    "Username": userName,
                    "Password": passowrd
                }
            }
        };
      client.addSoapHeader(soapHeader, '', 'tns', 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd');
          var params = {
                   "tns:configurationId": queueId,
                   "tns:phoneNumber": mobileNumber,
                   "tns:timeZone": "0",
                   "tns:answers": {
                     "ns0:TextAnswer": {
                     "ns0:answerText": "0",
                     "ns0:questionId": questionId
                      }
                   },
                   "tns:vdn": vdnNum,
                   "tns:uui": "1",
                   "tns:siteId": "1"   
                };  
            console.log('request papameter is', params);

              client.createImmediateWebCallbackRequest(params, function(err, result) {
                    console.log('last request:', client.lastRequest);
                    console.log('Req placing arguments!!!', params);
                    if (err) {
                        // handleError(err, response);
                        console.log('error in putting call request.');
                        callBack(err, null);
                    } else {

                      callBack(null, result);
                    }
                  });
              });
        }
                //POST REST endpoint - query params may or may not be populated
                callBackReq.post('/', function(req, response) {
                var email = req.body.emailId;
                var userType = req.body.userType;
                var phoneNum = req.body.phoneNumber;
                var callQueueId = req.body.callQueueId;
                var companyId = req.body.companyId;
                var vdnNum = req.body.vdnNum;
                var questionId = req.body.questionId;
                var primaryAddress = req.body.primaryAddress;
                var secondaryAddress = req.body.secondaryAddress;
                var isPrimaryAddressExist;
                var cbaURL;
                var searhOptions = {
                "act": "list",
                "type": constants.CALLBACK_REQUEST_TABLE,
                "eq": {
                "emailId": email,
                "status": "open",
                "companyId": companyId
                }
                };
                $fh.db(searhOptions, function (err, data) {
              if (err) {
                  console.error("Error " + err);
                   handleError(err, res);
              } else if (data.count == 1) {
                    response.json({errorResponse:{errorCode: constants.CREATE_CB_REQ_THERE_ERR, mesage: "You have one request open."}});
              } else {
                if (!(primaryAddress || secondaryAddress)) {
                    res.json({errorResponse: "CBA is missing", errorCode: constants.CREATE_CBA_MISS_ERR});
                }
                if (primaryAddress) {
                  cbaURL = primaryAddress;
                  isPrimaryAddressExist = true;
                } else if (secondaryAddress) {
                  cbaURL = secondaryAddress;
                  isPrimaryAddressExist = false;
                }decryptAvayacredentials(function(err, plainUserName,plainPassowrd){
                  if(!err){
                    createCallBackRequest(plainUserName, plainPassowrd, callQueueId, cbaURL, phoneNum, vdnNum, questionId, function(err, result) {
                      if (err) {
                        if(isPrimaryAddressExist && secondaryAddress) {
                            createCallBackRequest(plainUserName, plainPassowrd, callQueueId, secondaryAddress, phoneNum, vdnNum, questionId, function(err, result) {
                              if (err) {
                                response.json({errorResponse:{errorCode: constants.CREATE_CB_REQ_UNABLE_PROCESS, mesage: "We are unable to process your request right now."}});
                              } else {
                                if (result.return) {
                                  var nodeIp = result.return.nodeIP;
                                  var reqId = result.return.requestId;
                                  var options = {
                                    "act": "create",
                                    "type": constants.CALLBACK_REQUEST_TABLE, //Entity/Collection name
                                    "fields": {
                                      "companyId": companyId,
                                      "emailId": email,
                                      "userType": userType,
                                      "status": "open",
                                      "requestId": reqId,
                                      "date": new Date(),
                                      "queueId":callQueueId,
                                      "phoneNum": phoneNum,
                                      "serviceAddress": secondaryAddress
                                    }
                                  };
                                  $fh.db(options, function (err, data) {
                                    if (err) {
                                      console.error("Error " + err);
                                      handleError(err, res);
                                    } else {
                                        console.log(JSON.stringify(data));
                                        response.json({callBackReqDetails:{reqId: reqId, status: "open", phoneNumber: phoneNum, uniqueId: data.guid, serviceUrl: secondaryAddress}});
                                    }
                                  });
                                } 
                              }
                          });
                        } 
                      } else {
                      if (result.return) {
                        var nodeIp = result.return.nodeIP;
                        var reqId = result.return.requestId;
                        var options = {
                          "act": "create",
                          "type": constants.CALLBACK_REQUEST_TABLE, //Entity/Collection name
                          "fields": {
                                "companyId": companyId,
                                "emailId": email,
                                "userType": userType,
                                "status": "open",
                                "requestId": reqId,
                                "date": new Date(),
                                "queueId":callQueueId,
                                "phoneNum": phoneNum,
                                "serviceAddress": cbaURL
                          }
                      };
                      $fh.db(options, function (err, data) {
                        if (err) {
                            console.error("Error " + err);
                            handleError(err, res);
                        } else {
                            console.log(JSON.stringify(data));
                            response.json({callBackReqDetails:{reqId: reqId, status: "open", phoneNumber: phoneNum, uniqueId: data.guid, serviceAddress: cbaURL}});
                    }
                  });
                }
              }
            });
          }else{
            response.json({errorResponse:{errorCode: constants.DECRYPT_CREDENTIAL_ERR, mesage: "We are unable to process your request right now. Unable to decrypt username and password."}});
          }
          });
        }
      });
    });
    return callBackReq;
}
module.exports = createCallBackRoute;