var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
var async = require("async");
var fs = require("fs");
var uuid = require('uuid');
var path = require('path');
var _ = require('lodash');
var s3Uploads = {
    s3Buckets: {}
};

//region s3 csv Upload Bucket
var s3UploadBucket = new aws.S3({
    region: __config.aws_s3.bucket_config.region,
    accessKeyId: __config.aws_s3.bucket_config.accessKeyId,
    secretAccessKey: __config.aws_s3.bucket_config.secretAccessKey,
    params: {
        Bucket: __config.aws_s3.bucket_config.bucketName
    }
});
s3Uploads.s3Buckets.s3_csvUploadBucket = s3UploadBucket;

//region bulk csv upload example

//var csvUploadDbCtrl = require('../../app_module/csvUpload/csvUploadDbCtrl');
//var s3CsvUploadMulter = multer({
//    storage: multerS3({
//        s3: s3UploadBucket,
//        bucket: __config.aws_s3.bucket_config.bucketName,
//        metadata: function (req, file, cb) {
//            cb(null, file);
//        },
//        key: function (req, file, cb) {
//            var extension = path.extname(file.originalname);
//            if (extension.toLowerCase() != '.csv') {
//                return cb(__define.CUSTOM_CONSTANT.UPLOAD_ERROR_MSG.WRONG_EXTENSION, null);
//            }
//            req.upload_uuid = uuid.v4();//uuid.v4().split('-').join('');
//            req.upload_filename = req.upload_uuid + '.csv';
//            cb(null, 'csv/' + req.upload_filename);
//        }
//    }),
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
//s3Uploads.s3CsvUploadMulter = s3CsvUploadMulter;

//endregion

//filepath,filename,bucketname
function uploadFileInS3Bucket(s3Bucket, options, _callback) {
    var __m = "uploads.s3.uploadFileInS3Bucket";
    __logger.debug("in s3 file upload,", {m: __m, options: options});
    fs.readFile(options.filepath + '/' + options.filename, function (err, data) {
        if (err) {
            __logger.error("local file read failed. ", {m: __m, options: options, err: err});
            return _callback(err, null);
        }
        var params = {
            Key: options.bucketfilepath + options.filename,
            Body: data
        };
        s3Bucket.upload(params, function (error, s3data) {
            if (error) {
                __logger.error("s3 upload failed. ", {m: __m, options: options, err: error});
                return _callback(error, null);
            }
            fs.unlink(options.filepath + '/' + options.filename, function (fileunlinkError) {
                if (fileunlinkError) {
                    __logger.error("failed to delete local file ", {m: __m, options: options, err: fileunlinkError});
                }
                __logger.debug('local file Deleted', {m: __m, options: options});
            });
            __logger.debug('s3 upload success.', {m: __m, options: options});
            _callback(null, s3data);
        });
    });
}
s3Uploads.uploadFileInS3Bucket = uploadFileInS3Bucket;

//endregion
module.exports = s3Uploads;