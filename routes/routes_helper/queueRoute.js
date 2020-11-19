const express = require('express');
var basicRouter = express.Router(); // api which not required authentication
var authRouter = express.Router(); // api which required authentication
var routeName = "analytics ";
var analyticsCtrl = require('../../app_module/queue/queueCtrl');

function basicRoute(router) {
    __logger.debug(routeName + "route (basic) initialized...");
    return router;
}

function authenticateRoute(router) {
    __logger.debug(routeName + "route (authenticate) initialized...");
    router.post('/add/codeAnalytics/:queue_name', analyticsCtrl.sendToCodeAnalyticsQueue);
    router.post('/add/msgStatus', analyticsCtrl.sendToMsgStatusQueue);
    return router;
}

module.exports = {
    basicRouter: basicRoute(basicRouter),
    authRouter: authenticateRoute(authRouter)
};