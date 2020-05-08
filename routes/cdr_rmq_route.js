
const cdr_api = require("../app_modules/api/cdr/route");

module.exports = function (app) {
    app.use('/', cdr_api);
    // app.all("*", function(req, res, next){
    //     res.status(404).json({message: "Not Found"});
    // });
};
