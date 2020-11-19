var multer = require('multer');
var s3 = require('./s3');
var async = require("async");
var fs = require("fs");
var uuid = require('uuid');
var path = require('path');
var _ = require('lodash');
var uploads = {};


//region uploads

//default uploads
var basicUpload = multer({ dest: __config.app_settings.file_upload.default_path,
    limits: {fileSize: __config.app_settings.file_upload.max_file_size }
});
uploads.basicUpload = basicUpload;

//s3 bucket uploads
uploads.s3 = s3;

//region bulk csv upload example

//var csvUploadDbCtrl = require('../../app_module/csvUpload/csvUploadDbCtrl');
//var bulkSmsStorage = multer.diskStorage({
//    destination: function (request, file, cb) {
//        if (file) {
//            var filePath = __config.app_settings.file_upload.default_path + '/bulkSmsUploads';
//            var foldersNestedList = filePath.split('/');
//            __util.createDirectoryPath("", foldersNestedList, function (err, filePath) {
//                if (err) {
//                    cb(__define.CUSTOM_CONSTANT.UPLOAD_ERROR_MSG.UPLOAD_DIRECTORY_MISSING, null);
//                } else {
//                    cb(null, filePath);
//                }
//            });
//            //cb(null, __config.app_settings.file_upload.default_path + '/bulkSmsUploads');
//        }
//    },
//    filename: function (request, file, cb) {
//        if (file) {
//            var extension = path.extname(file.originalname);
//            if (extension.toLowerCase() != '.csv') {
//                return cb(__define.CUSTOM_CONSTANT.UPLOAD_ERROR_MSG.WRONG_EXTENSION, null);
//            }
//            request.upload_uuid = uuid.v4();//uuid.v4().split('-').join('');
//            request.upload_filename = request.upload_uuid + '.csv';
//            cb(null, request.upload_filename);
//        }
//    }
//});
//var basicCsvUpload = multer({
//    storage: bulkSmsStorage,
//    limits: {fileSize: __config.app_settings.file_upload.max_file_size },
//    fileFilter: function (req, file, cb) {
//        req.body.req_id = req.id;
//        csvUploadDbCtrl.blValidateCsvBulkApiRequest(req.body, function (error_type, apiAuthInfo) {
//            if (error_type) {
//                req.req_error_type = error_type;
//                return cb(error_type, null);
//            }
//            req.apiAuthInfo = apiAuthInfo;
//            cb(null, true);
//        });
//    }
//});
//uploads.basicCsvUpload = basicCsvUpload;

//endregion

function uploadFileInLocal(options, _callback) {
    var __m = "uploads.uploadFileInLocal";
    __logger.debug("in local file upload,", {m: __m, options: options});
    fs.writeFile(options.filepath + '/' + options.filename, options.filetext, function (err) {
        if (err) {
            __logger.error("failed to create local file ", {m: __m, options: options, err: err});
            return _callback(err, null);
        }
        __logger.debug("local file created.", {m: __m, options: options});
        _callback(null, true);

    });
}
uploads.uploadFileInLocal = uploadFileInLocal;

module.exports = uploads;


//endregion