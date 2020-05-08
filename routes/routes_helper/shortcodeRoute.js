/**
 *
 * @author deepak.ambekar [7/5/2018].
 */


const express = require('express');
var basicRouter = express.Router(); // api which not required authentication
var authRouter = express.Router(); // api which required authentication
var routeName = "ssp ";
var shortcodeCtrl = require('../../app_module/shortcode/shortcodeCtrl');

function basicRoute(router) {
    __logger.debug(routeName + "route (basic) initialized...");
    return router;
}

function authenticateRoute(router) {
    __logger.debug(routeName + "route (authenticate) initialized...");
    router.post('/generate/:api_owner', shortcodeCtrl.getShortCodes);
    return router;
}

module.exports = {
    basicRouter: basicRoute(basicRouter),
    authRouter: authenticateRoute(authRouter)
};