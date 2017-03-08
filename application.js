var mbaasApi = require('fh-mbaas-api');
var express = require('express');
var mbaasExpress = mbaasApi.mbaasExpress();
var cors = require('cors');

// list the endpoints which you want to make securable here
var securableEndpoints;
securableEndpoints = ['/hello','/userDetails','/getCallSupportDetails','/getAllITSupportLocations','/updateUserProfile','/getChatDetails','/getTechnicianDetails','/getTechList','/createCallBackRequest', '/getCallBackServices', '/cancelCbRequest', 
'/createVIPRequest', '/cancelVIPRequest', '/getVIPRequestStatus', '/getAllTickets', '/getCBRequestStatus', '/updateTechStatus', '/setUserLanguage', '/getAllCompanies', '/getWalkInCenters', '/createWalkInCenter', '/updateWalkInCenter', '/deleteWalkInCenter', '/createCompany', 
'/createCallServiceForCompany', '/createCallQueues', '/deleteCallService', '/deleteCallQueue', '/createChatServiceForCompany', '/createChatQueues', '/deleteChatService', '/deleteChatQueue', '/updateCallServiceForCompany', '/updateChatServiceForCompany', 
'/updateCallQueue', '/updateChatQueue', '/createUser', '/getUserDetailsForCompany', '/setSelfSupport', '/getMaintenanceMessage', '/createMaintenanceMessage', '/deleteMaintenanceMessage', '/getAllMaintenanceMessage', '/createMultipleUser', '/createMultipleTechUser', 
'/getSelfSupport', '/getServiceAnyWhere', '/getSingleCompanyDetails', '/getServiceNow', '/updateSelfSupport', '/updateSubTechId', '/deleteSelfSupport', '/updateCompanyDetails'];

var app = express();

// Enable CORS for all requests
app.use(cors());

// Note: the order which we add middleware to Express here is important!
app.use('/sys', mbaasExpress.sys(securableEndpoints));
app.use('/mbaas', mbaasExpress.mbaas);

// allow serving of static files from the public directory
app.use(express.static(__dirname + '/public'));

// Note: important that this is added just before your own Routes
app.use(mbaasExpress.fhmiddleware());

app.use('/hello', require('./lib/hello.js')());
app.use('/userDetails', require('./lib/userProfile.js')());
app.use('/getCallSupportDetails', require('./lib/getCallITSupportDetails.js')());
app.use('/getAllITSupportLocations', require('./lib/getITSupportSpots.js')());
app.use('/updateUserProfile',require('./lib/updateUserDetails.js')());
app.use('/getChatDetails',require('./lib/getChatITConfig.js')());
app.use('/getTechnicianDetails',require('./lib/getTechnicianDetails.js')());
app.use('/getTechList',require('./lib/getTechList.js')());
app.use('/createCallBackRequest',require('./lib/createCallBackRequest.js')());
app.use('/getEstimatedWaitTime',require('./lib/getEstimatedWaitTime.js')());
app.use('/getCallBackServices',require('./lib/getCallBackServices.js')());
app.use('/cancelCbRequest',require('./lib/cancelCbRequest.js')());
app.use('/createVIPRequest',require('./lib/createVIPRequest.js')());
app.use('/cancelVIPRequest',require('./lib/cancelVIPRequest.js')());
app.use('/getVIPRequestStatus',require('./lib/getVIPRequestStatus.js')());
app.use('/getAllTickets',require('./lib/getRequestForTech.js')());
app.use('/getCBRequestStatus',require('./lib/getCBRequestStatus.js')());
app.use('/updateTechStatus', require('./lib/updateTechStatus.js')());
app.use('/setUserLanguage', require('./lib/updateUserLang.js')());
app.use('/getAllCompanies', require('./lib/getAllCompanies.js')());
app.use('/getWalkInCenters', require('./lib/getWalkInCentersForCompany.js')());
app.use('/createWalkInCenter', require('./lib/createWalkInCenter.js')());
app.use('/updateWalkInCenter', require('./lib/updateWalkInCenter.js')());
app.use('/deleteWalkInCenter', require('./lib/deleteWalkInCenter.js')());
app.use('/createCompany', require('./lib/createCompany.js')());
app.use('/createCallServiceForCompany', require('./lib/createCallServiceForCompany.js')());
app.use('/createCallQueues', require('./lib/createCallQueues.js')());
app.use('/deleteCallService', require('./lib/deleteCallService.js')());
app.use('/deleteCallQueue', require('./lib/deleteCallQueue.js')());
app.use('/createChatServiceForCompany', require('./lib/createChatServiceForCompany.js')());
app.use('/createChatQueues', require('./lib/createChatQueues.js')());
app.use('/deleteChatService', require('./lib/deleteChatService.js')());
app.use('/deleteChatQueue', require('./lib/deleteChatQueue.js')());
app.use('/updateCallServiceForCompany', require('./lib/updateCallServiceForCompany.js')());
app.use('/updateChatServiceForCompany', require('./lib/updateChatServiceForCompany.js')());
app.use('/updateCallQueue', require('./lib/updateCallQueue.js')());
app.use('/updateChatQueue', require('./lib/updateChatQueue.js')());
app.use('/createUser', require('./lib/createUser.js')());
app.use('/getUserDetailsForCompany', require('./lib/getUserDetailsForCompany.js')());
app.use('/setSelfSupport', require('./lib/setSkypeAddress.js')());
app.use('/getMaintenanceMessage', require('./lib/getMaintenanceMessage.js')());
app.use('/createMaintenanceMessage', require('./lib/createMaintenanceMessage.js')());
app.use('/deleteMaintenanceMessage', require('./lib/deleteMaintenanceMessage.js')());
app.use('/getAllMaintenanceMessage', require('./lib/getAllMaintenanceMessage.js')());
app.use('/createMultipleUser', require('./lib/createMutlipleUser.js')());
app.use('/createMultipleTechUser', require('./lib/createMultipleTechUser.js')());
app.use('/getUserDetailsByUserType', require('./lib/getUserDetailsByUserType.js')());
app.use('/getSelfSupport', require('./lib/getSelfSupport.js')());
app.use('/getServiceAnyWhere', require('./lib/getServiceAnyWhere.js')());
app.use('/getSingleCompanyDetails', require('./lib/getSingleCompanyDetails.js')());
app.use('/getServiceNow', require('./lib/getServiceNow.js')());
app.use('/updateSelfSupport', require('./lib/updateSelfSupport.js')());
app.use('/updateSubTechId', require('./lib/updateSubTechId.js')());
app.use('/deleteSelfSupport', require('./lib/deleteSelfSupport.js')());
app.use('/updateCompanyDetails', require('./lib/updateCompanyDetails.js')());

// Important that this is last!
app.use(mbaasExpress.errorHandler());

var port = process.env.FH_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8001;
var host = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
app.listen(port, host, function() {
  console.log("App started at: " + new Date() + " on port: " + port); 
});
