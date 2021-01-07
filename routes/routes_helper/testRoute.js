const express = require('express');
var basicRouter = express.Router(); // api which not required authentication
var authRouter = express.Router(); // api which required authentication
var routeName = "test ";
var sspCtrl=require('../../app_module/ssp/sspCtrl');

function basicRoute(router) {
    router.post('/ssp', sspCtrl.sspTestApi);

   __logger.info(routeName + "route (basic) initialized...");
    return router;
}

function authenticateRoute(router) {

//    router.get('/test', test);

   __logger.info(routeName + "route (authenticate) initialized...");
    return router;
}

module.exports = {
    basicRouter: basicRoute(basicRouter),
    authRouter: authenticateRoute(authRouter)
};