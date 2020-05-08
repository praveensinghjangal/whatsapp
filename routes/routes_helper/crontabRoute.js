/**
 *
 * @author deepak.ambekar [7/18/2018].
 */

const express = require('express');
var basicRouter = express.Router(); // api which not required authentication
var authRouter = express.Router(); // api which required authentication
var routeName = "crontab ";
var crontabCtrl = require('../../app_module/crontab/crontabCtrl');

function basicRoute(router) {
    __logger.debug(routeName + "route (basic) initialized...");
    return router;
}

function authenticateRoute(router) {
    __logger.debug(routeName + "route (authenticate) initialized...");
    router.get('/archive', crontabCtrl.archivedHelo);
    router.get('/optimizePartitionSize', crontabCtrl.optimizedHeloTablePartitionSize);
    return router;
}

module.exports = {
    basicRouter: basicRoute(basicRouter),
    authRouter: authenticateRoute(authRouter)
};