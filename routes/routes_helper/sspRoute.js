/**
 *
 * @author deepak.ambekar [4/25/2018].
 */


const express = require('express');
var basicRouter = express.Router(); // api which not required authentication
var authRouter = express.Router(); // api which required authentication
var routeName = "ssp ";
var sspCtrl = require('../../app_module/ssp/sspCtrl');

function basicRoute(router) {
    router.post('/sspTestApi', sspCtrl.sspTestApi);
    router.post('/pingBack', sspCtrl.sspPingback);

    __logger.debug(routeName + "route (basic) initialized...");
    return router;
}

function authenticateRoute(router) {
//    router.get('/test', test);

    __logger.debug(routeName + "route (authenticate) initialized...");
    return router;
}

module.exports = {
    basicRouter: basicRoute(basicRouter),
    authRouter: authenticateRoute(authRouter)
};