/**
 * @namespace utils
 * @description utils
 * @author deepak.ambekar [5/25/2017].
 */
const __define = require('../../config/define');
var utils = {};

var moment = require('moment-timezone');
var crypto = require('crypto');
var _ = require('lodash');
var dateUtil = require('date-format-utils');   
var uuid = require("uuid");
var async = require('async');
var fs = require('fs');
var __logger = require("../logger");

//hasOwnProperty of object
var hasOwnProperty = Object.prototype.hasOwnProperty;


utils.date = {};

utils.date.now_in_ms = function () {
    return moment().format('x');
};

utils.date.now = function () {
    return moment().format('X');
};

utils.date.nowUTC_in_ms = function () {
    return moment().utc().format('x');
};

utils.date.nowUTC = function () {
    return moment().utc().format('X');
};

utils.date.get_current_datetime = function () {
    return moment().format('YYYY-MM-DD HH:mm:ss')
};

utils.date.convertUTCToLocalTimeZone = function (utcepochtime, timezone) {
    return moment().tz(moment.utc(utcepochtime * 1000), timezone).format('X');
};

// Running the following code before any other code will create Array.isArray() if it's not natively available
if (!Array.isArray) {
    Array.isArray = function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

/**
 * check valid response code [mention in constants>>MESSAGES].
 * @memberof utils
 * @param code {number} response code
 * @return {{valid: boolean, statusCode: number}}
 */
function validateResponseCode(code) {
    var obj = {
        valid: false,
        statusCode: 200
    };
    for (var key in __define.RESPONSE_MESSAGES) {
        if (__define.RESPONSE_MESSAGES[key].code == code) {
            obj.valid = true;
            obj.statusCode = __define.RESPONSE_MESSAGES[key].status_code;
            break;
        }
    }
    return obj;
};
utils.validateResponseCode = validateResponseCode;

/**
 * send response of service based on options provided.
 * @memberof utils
 * @param response {object} used to send response
 * @param options {{type:object,custom_msg:string,custom_code:number,err:object,data:object}} send options
 */
function send(response, options) {
    // __logger.debug(response, options);

    if (options.custom_response) {
        return response.status(options.custom_status_code || 200).json(options.custom_response);
    }

    var resData = {};
    var code = __define.RESPONSE_MESSAGES.INVALID_CODE.code;
    var msg = __define.RESPONSE_MESSAGES.INVALID_CODE.message;
    var data = options.data || null;
    var err = options.err || null;
    if (!isEmpty(options.type) && !findMissingKeyInObject(options.type, ['code', 'message'])) {
        code = options.type.code;
        msg = options.type.message;
    }
    if (options.custom_code)
        code = options.custom_code;
    if (options.custom_msg)
        msg = options.custom_msg;

    if (code == __define.RESPONSE_MESSAGES.INVALID_CODE.code) {
        msg = __define.RESPONSE_MESSAGES.INVALID_CODE.message;
        data = null;
        err = "Response code not mention so default INVALID_CODE response code selected. please mention valid response code, refer 'constants >> RESPONSE_MESSAGES object'";
    }

    var validCodeObj = validateResponseCode(code);
    if (!validCodeObj.valid)
        __logger.debug("add response code '" + code + "' in constants >> RESPONSE_MESSAGES object");
    resData.code = code;
    resData.msg = msg;
    resData.data = data;
    if (process.env.NODE_ENV === __define.CUSTOM_CONSTANT.DEV_ENV && err) {
        resData.error = err;
    }
    if (!response.is_sent) {
        response.is_sent = true;
        if (!_.isEmpty(options.headers) && !_.isArray(options.headers) && _.isPlainObject(options.headers)) {
            response.set(options.headers);
        }
        response.status(validCodeObj.statusCode || 200).json(resData);
    }
};
utils.send = send;
/**
 * Check object contain all keys in keyList
 * @memberof utils
 * @param obj {object} object
 * @param keyList {array} array of object key
 */
function findMissingKeyInObject(obj, keyList) {
    var missingKeys = [];
    if (keyList && keyList.length > 0) {
        _.each(keyList, function (key) {
            if (!hasOwnProperty.call(obj, key) || obj[key] === null)
                missingKeys.push(key);
        });
    }
    if (missingKeys.length === 0)
        return false;
    else
        return missingKeys.toString();
}
utils.findMissingKeyInObject = findMissingKeyInObject;

/**
 * check any required parameter is missing from request object or array object.
 * @memberof utils
 * @param request {object} request body
 * @param requiredParams {array} required params in request body
 * @return {*}
 */
function checkRequiredMissingParam(request, requiredParams) {
    var missingRequiredParamMsg = null;
    if (requiredParams && requiredParams.length > 0) {
        if (isArray(request)) {
            if (request.length > 0) {
                for (var i = 0; i < request.length; i++) {
                    var missingKeys = findMissingKeyInObject(request[i], requiredParams);
                    if (missingKeys) {
                        __logger.debug("Missing parameter [" + missingKeys + "] in array of object =>" + JSON.stringify(request[i]));
                        missingRequiredParamMsg = "Missing parameter in request. [" + missingKeys + "] is missing in array of object";
                        break;
                    }
                }
            } else {
                missingRequiredParamMsg = "Missing parameter in request. Empty array request found.";
            }
        } else if (!_.isEmpty(request)) {
            var missingKeys = findMissingKeyInObject(request, requiredParams);
            if (missingKeys) {
                missingRequiredParamMsg = "Missing parameter in request. [" + missingKeys + "]";
            }
        } else {
            missingRequiredParamMsg = "Missing parameter in request. Empty request found.";
        }
    }

    if (_.isEmpty(missingRequiredParamMsg))
        return false;
    else
        return missingRequiredParamMsg;
}
utils.checkRequiredMissingParam = checkRequiredMissingParam;

function getTrueFalseValue(input) {
    if (input == 1 || input == "1" || input == true || input == "true")
        return true;
    else
        return false;
}
utils.getTrueFalseValue = getTrueFalseValue;

function isUndefinedNull(val) {
    if (val == 0 || val == false)
        return false;
    if (val == undefined || val == null || val == "")
        return true;
    return false;
}
utils.isUndefinedNull = isUndefinedNull;
/**
 * 'true' if object is empty otherwise 'false'
 * @memberof utils
 * @param obj {object} object can be 'object,string,number,array'
 * @returns {boolean}
 */
function isEmpty(obj) {
    // null and undefined are "empty"
    if (obj == 0 || obj == false)
        return false;

    if (obj == undefined || obj == null || obj == "")
        return true;

    if (typeof obj == "number" || typeof obj == "string" || typeof obj == "boolean")
        return false;
    // Assume if it has a length property with a non-zero value
    // that property is correct.
    if (obj.length > 0)
        return false;
    if (obj.length <= 0)
        return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key))
            return false;
    }
    return true;
}
utils.isEmpty = isEmpty;

/**
 * 'true' if object is array otherwise 'false'
 * @memberof utils
 * @param arr {array} array object
 * @returns {boolean}
 */
function isArray(arr) {
    try {
        return Array.isArray(arr);
    } catch (e) {
        __logger.error("Error in isArray function, ", e);
        return false;
    }
}
utils.isArray = isArray;

/**
 * return function name with file path.
 * @memberof utils
 * @param filePath
 * @param functionName
 * @returns {string}
 */
function formatFunctionName(filePath, functionName, reqId) {
    var uuid = "";
    if (reqId)
        uuid = "[" + reqId + "] => ";
    return uuid + filePath + "/{" + functionName + "} => ";
}
utils.formatFunctionName = formatFunctionName;
/**
 * get expire timestamp based on second provided.
 * @memberof utils
 * @param seconds {number} seconds to add in current time
 * @returns {number}
 */
function expiresAt(seconds) {
    var date = new Date();
    date.setSeconds(date.getSeconds() + seconds);
    return date.getTime();
}
utils.expiresAt = expiresAt;

/**
 * get hamc of text based on key and encodeType
 * @memberof utils
 * @param text {string} text
 * @param key {string} key used to create hmac
 * @param encodeType {string} algorithm to create hmac [default: sha256]
 * @returns {*}
 */
function getHmac(text, key, encodeType) {
    var secretkey = __config.authConfig.secretKey;
    var encodeMethod = 'sha256';
    if (key)
        secretkey = key;
    if (encodeType)
        encodeMethod = encodeType;
    return crypto.createHmac(encodeMethod, secretkey).update(text).digest('hex');
}
utils.getHmac = getHmac;

/**
 * encrypt text
 * @memberof utils
 * @param text {string} text to encrypt
 * @returns {*}
 */
function encryptCipher(text) {
    var cipher = crypto.createCipher(__config.authConfig.cipherAlgorithm, __config.authConfig.secretKey);
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}
utils.encryptCipher = encryptCipher;

/**
 * decrypt text
 * @memberof utils
 * @param text {string} encrypted text
 * @returns {*}
 */
function decryptCipher(text) {
    var decipher = crypto.createDecipher(__config.authConfig.cipherAlgorithm, __config.authConfig.secretKey);
    var dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}
utils.decryptCipher = decryptCipher;

function stringMatch(str1, str2) {
    if (!isEmpty(str1) && !isEmpty(str2)) {
        if (str1.toLowerCase() == str2.toLowerCase())
            return true;
    }
    return false;
}
utils.stringMatch = stringMatch;

function matchElementInStringArray(stringArrayList, keyword) {
    var found = false;
    for (var i = 0; i < stringArrayList.length; i++) {
        if (stringMatch(stringArrayList[i], keyword)) {
            found = true;
            break;
        }
    }
    return found;
}
utils.matchElementInStringArray = matchElementInStringArray

function getValidUpdateObject(data) {
    var validUpdateObj = {};
    if (!isEmpty(data) && !isArray(data) && typeof data == 'object') {
        for (var key in data) {
            var value = data[key];
            if (value !== __define.CUSTOM_CONSTANT.NOT_TO_UPDATE) {
                validUpdateObj[key] = value;
            }
        }
    }
    return validUpdateObj;
}
utils.getValidUpdateObject = getValidUpdateObject;

//region short code generation
var alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
var base = alphabet.length; // base is the length of the alphabet (58 in this case)

var shortcodes = [];
var shortcodes_json = {};

// utility function to convert base 10 integer to base 58 string
function encodeShortCode(num) {
    var encoded = '';
    while (num) {
        var remainder = num % base;
        num = Math.floor(num / base);
        encoded = alphabet[remainder].toString() + encoded;
    }
    return encoded;
}

// utility function to convert a base 58 string to base 10 integer
function decodeShortCode(str) {
    var decoded = 0;
    while (str) {
        var index = alphabet.indexOf(str[0]);
        var power = str.length - 1;
        decoded += index * (Math.pow(base, power));
        str = str.substring(1);
    }
    return decoded;
}

function generate6CharShortCode(text) {
    text = _.padStart(text.toString(), 10, '0');
    var reverse_code = text.split("").reverse().join("");
    if (text.length < 10 || reverse_code.indexOf('0') == 0 || reverse_code == text)
        return null;
    var encoded = encodeShortCode(reverse_code);
    if (encoded.length != 6)
        return null;

    // shortcodes.push(encoded);
    // shortcodes_json[encoded] = true;
    return encoded;
}
// utils.shortcodes = shortcodes;
// utils.shortcodes_json = shortcodes_json;
utils.generate6CharShortCode = generate6CharShortCode;
//endregion

function checkSupportAccess(support_user_type, access_types) {
    var access = false;
    if (support_user_type && access_types && access_types.length > 0) {
        for (var i = 0; i < access_types.length; i++) {
            if (support_user_type.toLowerCase() == access_types[i].toLowerCase()) {
                access = true;
                break;
            }
        }
    }
    return access;
}
utils.checkSupportAccess = checkSupportAccess;

function objectToTextMsg(object_json) {
    var text = "";
    if (object_json) {
        for (var key in object_json) {
            if (typeof object_json[key] == "string" ||
                typeof object_json[key] == "number" ||
                typeof object_json[key] == "boolean")
                text = text + key + ":" + object_json[key] + ";"
        }
    }
    return text;
}
utils.objectToTextMsg = objectToTextMsg;

function getServiceName(serviceUrl) {
    return serviceUrl.split('/')[serviceUrl.split('/').length - 1];
}
utils.getServiceName = getServiceName;

function checkValidDevicePlatform(devicePlatform) {
    var dp = null;
    for (var key in __define.CUSTOM_CONSTANT.DEVICE_PLATFORM) {
        if (devicePlatform.toLowerCase() == __define.CUSTOM_CONSTANT.DEVICE_PLATFORM[key].toLowerCase()) {
            dp = __define.CUSTOM_CONSTANT.DEVICE_PLATFORM[key];
        }
    }
    return dp;
}
utils.checkValidDevicePlatform = checkValidDevicePlatform;

function getMatchValueInObject(obj, value) {
    var val = null;
    if (!_.isEmpty(value)) {
        var value = value.toString();
        for (var key in obj) {
            if (value.toLowerCase() == obj[key].toString().toLowerCase()) {
                val = obj[key];
            }
        }
    }
    return val;
}
utils.getMatchValueInObject = getMatchValueInObject;

function validateDate(d) {
    var numRegex = /^\d+$/;
    if (d) {
        var dateObj;
        try {
            if (numRegex.test(d) == true && typeof d == 'string')
                d = Number(d);
            dateObj = new Date(d);
            if (dateObj && dateObj.toString().search(/invalid/gi) != -1)
                return null;
            return dateObj;
        } catch (e) {
            return null;
        }
    }
    return null;
}
utils.validateDate = validateDate;

function getFromAndToDate(fromDate, toDate, format, onlyDays) {
    try {
        if (typeof fromDate == 'string' || typeof fromDate == 'number')
            fromDate = new Date(fromDate);
        if (typeof toDate == 'string')
            toDate = new Date(toDate);
        if (onlyDays) {
            fromDate.setHours(0);
            fromDate.setMinutes(0);
            fromDate.setSeconds(0);
            fromDate.setMilliseconds(0);
            toDate.setHours(23);
            toDate.setMinutes(59);
            toDate.setSeconds(59);
            toDate.setMilliseconds(999);
        }

        return {
            from_date: dateUtil.formatDate(fromDate, (format || "yyyy-MM-dd HH:mm:ss.SSS")),
            to_date: dateUtil.formatDate(toDate, (format || "yyyy-MM-dd HH:mm:ss.SSS"))
        };
    }
    catch (e) {
        __logger.error("failed to set from and to date. error:", e);
        return null;
    }
}
utils.getFromAndToDate = getFromAndToDate;

function setTime(date, hr, min, sec, ms) {
    date.setHours(hr || 0);
    date.setMinutes(min || 0);
    date.setSeconds(sec || 0);
    date.setMilliseconds(ms || 0);
    return date;
}
utils.setTime = setTime;

function getBrowserName(browser) {
    if (browser) {
        var nameList = [];
        for (var key in browser) {
            if (browser[key] == true)
                nameList.push(key);
        }
        if (nameList.length > 0)
            return nameList.join(' ');
    }
    return "none";
}
utils.getBrowserName = getBrowserName;

//region validate mobile number

function validate_mobile(msisdn, countrycode) {
    var parsed_msisdn = parse_msisdn(msisdn, countrycode);
    var regexp_digits = /^[0-9]{7,15}$/g;
    if (isNaN(parsed_msisdn)) {
        return false;
    }
    if (parsed_msisdn.match(regexp_digits) === null ||
        parseInt(parsed_msisdn) === 0 ||
        parseInt(parsed_msisdn.substr(-10)) === 0) {
        return false;
    } else {
        return true;
    }
};
utils.validate_mobile = validate_mobile;

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}
function parse_msisdn(msisdn, countrycode) {
    msisdn = msisdn.toString().replace(/^\++/, '');
    msisdn = msisdn.toString().replace(/^0+/, '0');
    //todo: it can give error in international number
    if (isNaN(msisdn)) {
        return msisdn;
    } else if (countrycode == "91") {
        if (msisdn.length === 10) {
            return "91" + msisdn;
        }
        else if (msisdn.length === 11 && msisdn.startsWith('0')) {
            return "91" + msisdn.substr(-10);
        }
        else if (msisdn.length === 12 && msisdn.startsWith('91')) {
            return "91" + msisdn.substr(-10);
        }
        else if (msisdn.length === 13 && msisdn.startsWith('091')) {
            return "91" + msisdn.substr(-10);
        }
        else {
            return msisdn;
        }
    }
    else {
        return msisdn;
    }
}

//endregion

//region SMS count
function getSmsCount(message_length, unicode) {
    if (unicode) {
        switch (true) {
            case (_.inRange(message_length, 1, 71)):
                return 1;
            case (_.inRange(message_length, 71, 131)):
                return 2;
            case (_.inRange(message_length, 131, 196)):
                return 3;
            case (_.inRange(message_length, 196, 261)):
                return 4;
            case (_.inRange(message_length, 261, 326)):
                return 5;
            case (_.inRange(message_length, 326, 391)):
                return 6;
            case (_.inRange(message_length, 391, 456)):
                return 7;
            case (_.inRange(message_length, 456, 521)):
                return 8;
            case (_.inRange(message_length, 521, 586)):
                return 9;
            case (_.inRange(message_length, 586, 651)):
                return 10;
            default:
                return "invalid message length (max allowed: 650)";
        }
    } else {
        switch (true) {
            case (_.inRange(message_length, 1, 161)):
                return 1;
            case (_.inRange(message_length, 161, 307)):
                return 2;
            case (_.inRange(message_length, 307, 460)):
                return 3;
            case (_.inRange(message_length, 460, 613)):
                return 4;
            case (_.inRange(message_length, 613, 766)):
                return 5;
            case (_.inRange(message_length, 766, 919)):
                return 6;
            case (_.inRange(message_length, 919, 1072)):
                return 7;
            case (_.inRange(message_length, 1072, 1225)):
                return 8;
            case (_.inRange(message_length, 1225, 1378)):
                return 9;
            case (_.inRange(message_length, 1378, 1501)):
                return 10;
            default:
                return "invalid message length (max allowed: 1500)";
        }
    }
}
utils.getSmsCount = getSmsCount;

function getMessageLength(message) {
    var __m = 'utils.getMessageLength';
    var message_length = 0;
    try {
        //__logger.debug('message length by .length() function', {m: __m, message_length: message.length});
        if (Buffer.isBuffer(message)) {
            message_length = message.length;
            message = message.toString().substr(0, message.toString().length - 1)
        }
        else {
            for (var i = 0; i < message.length; i++) {
                var ascii_value = message.charCodeAt(i);
                var char_count = 1;
                switch (true) {
                    case((ascii_value >= 32 && ascii_value <= 90) || (ascii_value >= 97 && ascii_value <= 122) || __define.CUSTOM_CONSTANT.CHAR_COUNT.ONE.includes(ascii_value)):
                        char_count = 1;
                        break;
                    case(__define.CUSTOM_CONSTANT.CHAR_COUNT.TWO.includes(ascii_value)):
                        char_count = 2;
                        break;
                    case (__define.CUSTOM_CONSTANT.CHAR_COUNT.THREE.includes(ascii_value)):
                        char_count = 3;
                        break;
                }
                message_length += char_count;
            }
        }
        //__logger.debug('message length by custom logic', {m: __m, message_length: message_length});
    } catch (e) {
        __logger.error('exception', {m: __m, err: e});
    }
    return message_length;
}
utils.getMessageLength = getMessageLength;
//endregion

function getMessageCreditCount(message, unicode) {
    var msg_credits = getSmsCount(getMessageLength(message), unicode);
    if (_.isNumber(msg_credits))
        return {err_msg: null, msg_credit_count: msg_credits};
    return {err_msg: msg_credits, msg_credit_count: null};
}
utils.getMessageCreditCount = getMessageCreditCount;

//region sms request validation
// require sms_body.message,sms_body.unicode,sms_body.list,sms_body.list[index].message
function credit_calculation(sms_body) {
    var total_credits = 0;
    var default_message_length = 0;
    var err_msg = null;
    if (sms_body.message)
        default_message_length = getMessageLength(sms_body.message);

    for (var i = 0; i < sms_body.list.length; i++) {
        //check if message attribute is overloaded in JSON
        var msg_credits = 0;
        if (sms_body.list[i].message) {
            // calculate new message_length of the overloaded message in JSON
            var new_message_length = getMessageLength(sms_body.list[i].message);
            msg_credits = getSmsCount(new_message_length, sms_body.unicode);

        } else {
            msg_credits = getSmsCount(default_message_length, sms_body.unicode);
        }
        if (_.isNumber(msg_credits))
            total_credits += msg_credits;
        else {
            err_msg = msg_credits;
            break;
        }
    }
    return {err_msg: err_msg, total_credits: total_credits};
}
utils.credit_calculation = credit_calculation;

// return updated sms_body after validation
// json imp keys=> to,message,sender_id,schedule_datetime
function validateSmsRequest(sms_body) {
    sms_body.err_msg = null;
    sms_body.unicode = false;
    sms_body.is_personalize = false;
    sms_body.is_scheduled = false;
    //check is_unicode
    if (sms_body.coding === '1' || sms_body.charset === 'UTF-8') {
        sms_body.unicode = true;
    }
    //convert request mobiles string into list
    if (_.isString(sms_body.to) || _.isArray(sms_body.to)) {
        if (sms_body.to.indexOf(',') != -1) {
            sms_body.list = sms_body.to.split(',');
        }
        else if (sms_body.to.indexOf(' ') != -1) {
            sms_body.list = sms_body.to.split(' ');
        } else if (_.isArray(sms_body.to)) {
            sms_body.list = sms_body.to;
        }
        else {
            sms_body.list = [sms_body.to];
        }
    }
    else {
        sms_body.err_msg = "invalid number list attribute, must be a string or array object";
        return sms_body;
    }
    //check/validate schedule_datetime
    if (sms_body.schedule_datetime) {
        if (!_.isString(sms_body.schedule_datetime)) {
            sms_body.err_msg = "invalid schedule_datetime attribute, must be a string";
            return sms_body;
        }
        var temp_schedule_stamp = __util.validateDate(sms_body.schedule_datetime);
        if (!temp_schedule_stamp) {
            sms_body.err_msg = "schedule_datetime should be valid date";
            return sms_body;
        }
        else {
            var now_stamp = dateUtil.toTimestamp(new Date(), 'ms');
            var schedule_stamp = dateUtil.toTimestamp(temp_schedule_stamp, 'ms');
            if ((schedule_stamp - now_stamp) < (-1000 * 60 * 1.5)) {
                sms_body.err_msg = "schedule_datetime is behind current date time.";
                return sms_body;
            } else {
                sms_body.schedule_datetime = dateUtil.formatDate(schedule_stamp, "yyyy-MM-dd HH:mm:ss")
                sms_body.is_scheduled = true;
            }
        }
    }

    //check/validate sender_id
    if (!_.isString(sms_body.sender_id)) {
        sms_body.err_msg = "invalid sender_id attribute, must be a string";
        return sms_body;
    } else if (!(/^[A-z]+$/).test(sms_body.sender_id)) {
        sms_body.err_msg = "invalid sender_id attribute, must be a characters only";
        return sms_body;
    } else if (sms_body.sender_id.length != 6) {
        sms_body.err_msg = "invalid sender_id attribute, length must be a 6 character";
    }
    //check/validate countrycode
    if (!_.isString(sms_body.countrycode)) {
        sms_body.err_msg = "invalid countrycode attribute, must be a string";
        return sms_body;
    } else if (!(/^[0-9]*$/).test(sms_body.countrycode)) {
        sms_body.err_msg = "invalid countrycode attribute, must be a number characters only";
        return sms_body;
    }
    //validate message attribute
    if (!_.isString(sms_body.message)) {
        sms_body.err_msg = "invalid message attribute, must be a string";
        return sms_body;
    }
    //validate mobile list size
    if (sms_body.list && sms_body.list.length < 0) {
        sms_body.err_msg = "missing or blank number list attribute";
        return sms_body;
    }
    if (sms_body.list.length > __define.CUSTOM_CONSTANT.MAX_BULK_SMS_REQUEST_SIZE) {
        sms_body.err_msg = "maximum number list size[" + __define.CUSTOM_CONSTANT.MAX_BULK_SMS_REQUEST_SIZE + "] exceeded"
        return sms_body;
    }
    //mobile list validation
    var list_type = typeof sms_body.list[0];
    var valid_list_object_attributes = ['d', 'destination', 'm', 'message'];//, 'rp', 'replace_pattern'];
    //var valid_rp_list_object_attributes = ['rv', 'replace_value', 'pv', 'pattern_value'];
    var checkDup = {};
    var total_credits = 0;
    var default_msg_credit = 0;
    var defaultCredits = getMessageCreditCount(sms_body.message);
    if (defaultCredits.err_msg) {
        sms_body.err_msg = defaultCredits.err_msg;
        return sms_body;
    } else {
        default_msg_credit = defaultCredits.msg_credit_count;
    }

    for (var i = 0; i < sms_body.list.length; i++) {
        if ((typeof sms_body.list[i]) != list_type) {
            sms_body.err_msg = "number list must be of type: " + list_type;
            break;
        }
        var msgCredits = null;
        if (list_type == 'object') {
            var list_object_attributes = Object.keys(sms_body.list[i]);
            list_object_attributes.forEach(function (list_object_attribute) {
                //console.log(sms_body.list);
                if (!valid_list_object_attributes.includes(list_object_attribute)) {
                    sms_body.err_msg = "invalid attribute for list object : " + list_object_attribute;
                }
            });
            if (sms_body.err_msg)
                break;

            if (!sms_body.list[i].hasOwnProperty('d') && !sms_body.list[i].hasOwnProperty('destination')) {
                sms_body.err_msg = "object inside list array must contain destination|d";
                break;
            }
            sms_body.list[i].destination = sms_body.countrycode + '' + (sms_body.list[i].d ? sms_body.list[i].d : sms_body.list[i].destination);
            if (!validate_mobile(sms_body.list[i].destination, sms_body.countrycode)) {
                sms_body.err_msg = "number list has some invalid destination|d";
                break;
            }
            delete sms_body.list[i].d;

            if (sms_body.list[i].hasOwnProperty('m') || sms_body.list[i].hasOwnProperty('message')) {
                sms_body.list[i].message = sms_body.list[i].m ? sms_body.list[i].m : sms_body.list[i].message;
                if (!sms_body.list[i].message || !_.isString(sms_body.list[i].message)) {
                    sms_body.err_msg = "blank or invalid message|m attribute, must be a string";
                    break;
                }
                delete sms_body.list[i].m;
            } else {
                sms_body.err_msg = "object inside list array must contain message|m";
                break;
            }

            msgCredits = getMessageCreditCount(sms_body.list[i].message);
            if (msgCredits.err_msg) {
                sms_body.err_msg = msgCredits.err_msg;
                break;
            } else {
                total_credits += msgCredits.msg_credit_count;
            }

            if (sms_body.err_msg)
                break;

        } else {
            sms_body.list[i] = sms_body.countrycode + '' + sms_body.list[i];
            checkDup[sms_body.list[i]] = 1;
            if (!validate_mobile(sms_body.list[i], sms_body.countrycode)) {
                sms_body.err_msg = "number list has some invalid destinations";
                break;
            }
            total_credits += default_msg_credit;
        }
    }
    sms_body.is_personalize = false;
    if (!sms_body.err_msg) {
        //check list type and number duplicates
        if (list_type == 'object') {
            sms_body.is_personalize = true;
        } else {
//            console.log("sms_body.list.length::",sms_body.list.length);
//            console.log("Object.keys(checkDup).length::",Object.keys(checkDup).length);
            if (sms_body.list.length != Object.keys(checkDup).length) {
                sms_body.err_msg = "numbers list have duplicate numbers.";
                return sms_body;
            }
        }
        //calculate credit
        //        var credit_info = credit_calculation(sms_body);
        //        if (credit_info.err_msg) {
        //            sms_body.err_msg = credit_info.err_msg;
        //        }
        //        else {
        //            console.log("credit_info.total_credits::",credit_info.total_credits);
        //            sms_body.total_credits = credit_info.total_credits;
        //        }
        //        console.log("total_credits::",total_credits);
        sms_body.total_credits = total_credits;
    }
    //sms_body.err_msg,sms_body.total_credits,sms_body.list,sms_body.list[i].destination
    return sms_body;
}
utils.validateSmsRequest = validateSmsRequest;


function validateSmsRequestWithCallback(sms_body, _callback) {
    sms_body.err_msg = null;
    sms_body.unicode = false;
    sms_body.is_personalize = false;
    sms_body.is_scheduled = false;
    //check is_unicode
    if (sms_body.coding === '1' || sms_body.charset === 'UTF-8') {
        sms_body.unicode = true;
    }
    //convert request mobiles string into list
    if (_.isString(sms_body.to) || _.isArray(sms_body.to)) {
        if (sms_body.to.indexOf(',') != -1) {
            sms_body.list = sms_body.to.split(',');
        }
        else if (sms_body.to.indexOf(' ') != -1) {
            sms_body.list = sms_body.to.split(' ');
        } else if (_.isArray(sms_body.to)) {
            sms_body.list = sms_body.to;
        }
        else {
            sms_body.list = [sms_body.to];
        }
    }
    else {
        sms_body.err_msg = "invalid number list attribute, must be a string or array object";
        return _callback(sms_body);
    }
    //check/validate schedule_datetime
    if (sms_body.schedule_datetime) {
        if (!_.isString(sms_body.schedule_datetime)) {
            sms_body.err_msg = "invalid schedule_datetime attribute, must be a string";
            return _callback(sms_body);
        }
        var temp_schedule_stamp = __util.validateDate(sms_body.schedule_datetime);
        if (!temp_schedule_stamp) {
            sms_body.err_msg = "schedule_datetime should be valid date";
            return _callback(sms_body);
        }
        else {
            var now_stamp = dateUtil.toTimestamp(new Date(), 'ms');
            var schedule_stamp = dateUtil.toTimestamp(temp_schedule_stamp, 'ms');
            if ((schedule_stamp - now_stamp) < (-1000 * 60 * 1.5)) {
                sms_body.err_msg = "schedule_datetime is behind current date time.";
                return _callback(sms_body);
            } else {
                sms_body.schedule_datetime = dateUtil.formatDate(schedule_stamp, "yyyy-MM-dd HH:mm:ss")
                sms_body.is_scheduled = true;
            }
        }
    }

    //check/validate sender_id
    if (!_.isString(sms_body.sender_id)) {
        sms_body.err_msg = "invalid sender_id attribute, must be a string";
        return _callback(sms_body);
    } else if (!(/^[A-z]+$/).test(sms_body.sender_id)) {
        sms_body.err_msg = "invalid sender_id attribute, must be a characters only";
        return _callback(sms_body);
    } else if (sms_body.sender_id.length != 6) {
        sms_body.err_msg = "invalid sender_id attribute, length must be a 6 character";
        return _callback(sms_body);
    }
    //check/validate countrycode
    if (!_.isString(sms_body.countrycode)) {
        sms_body.err_msg = "invalid countrycode attribute, must be a string";
        return _callback(sms_body);
    } else if (!(/^[0-9]*$/).test(sms_body.countrycode)) {
        sms_body.err_msg = "invalid countrycode attribute, must be a number characters only";
        return _callback(sms_body);
    }
    //validate message attribute
    if (!_.isString(sms_body.message)) {
        sms_body.err_msg = "invalid message attribute, must be a string";
        return _callback(sms_body);
    }
    //validate mobile list size
    if (sms_body.list && sms_body.list.length < 0) {
        sms_body.err_msg = "missing or blank number list attribute";
        return _callback(sms_body);
    }
    if (sms_body.list.length > __define.CUSTOM_CONSTANT.MAX_BULK_SMS_REQUEST_SIZE) {
        sms_body.err_msg = "maximum number list size[" + __define.CUSTOM_CONSTANT.MAX_BULK_SMS_REQUEST_SIZE + "] exceeded"
        return _callback(sms_body);
    }
    //mobile list validation
    var list_type = typeof sms_body.list[0];
    var valid_list_object_attributes = ['d', 'destination', 'm', 'message'];//, 'rp', 'replace_pattern'];
    //var valid_rp_list_object_attributes = ['rv', 'replace_value', 'pv', 'pattern_value'];
    var checkDup = {};
    var total_credits = 0;
    var default_msg_credit = 0;
    var defaultCredits = getMessageCreditCount(sms_body.message);
    if (defaultCredits.err_msg) {
        sms_body.err_msg = defaultCredits.err_msg;
        return _callback(sms_body);
    } else {
        default_msg_credit = defaultCredits.msg_credit_count;
    }

    //region validation of sms mobile list using async
    var updateList = [];
    async.each(sms_body.list, function (mobile, fcallback) {
        if ((typeof mobile) != list_type) {
            sms_body.err_msg = "number list must be of type: " + list_type;
            return fcallback(sms_body.err_msg);
        }
        var msgCredits = null;
        if (list_type == 'object') {
            var list_object_attributes = Object.keys(mobile);
            list_object_attributes.forEach(function (list_object_attribute) {
                //console.log(sms_body.list);
                if (!valid_list_object_attributes.includes(list_object_attribute)) {
                    sms_body.err_msg = "invalid attribute for list object : " + list_object_attribute;
                }
            });
            if (sms_body.err_msg)
                return fcallback(sms_body.err_msg);

            if (!mobile.hasOwnProperty('d') && !mobile.hasOwnProperty('destination')) {
                sms_body.err_msg = "object inside list array must contain destination|d";
                return fcallback(sms_body.err_msg);
            }
            mobile.destination = sms_body.countrycode + '' + (mobile.d ? mobile.d : mobile.destination);
            if (!validate_mobile(mobile.destination, sms_body.countrycode)) {
                sms_body.err_msg = "number list has some invalid destination|d";
                return fcallback(sms_body.err_msg);
            }
            delete mobile.d;

            if (mobile.hasOwnProperty('m') || mobile.hasOwnProperty('message')) {
                mobile.message = mobile.m ? mobile.m : mobile.message;
                if (!mobile.message || !_.isString(mobile.message)) {
                    sms_body.err_msg = "blank or invalid message|m attribute, must be a string";
                    return fcallback(sms_body.err_msg);
                }
                delete mobile.m;
            } else {
                sms_body.err_msg = "object inside list array must contain message|m";
                return fcallback(sms_body.err_msg);
            }

            msgCredits = getMessageCreditCount(mobile.message);
            if (msgCredits.err_msg) {
                sms_body.err_msg = msgCredits.err_msg;
                return fcallback(sms_body.err_msg);
            } else {
                total_credits += msgCredits.msg_credit_count;
            }

            if (sms_body.err_msg)
                return fcallback(sms_body.err_msg);

        } else {
            mobile = sms_body.countrycode + '' + mobile;
            checkDup[mobile] = 1;
            if (!validate_mobile(mobile, sms_body.countrycode)) {
                sms_body.err_msg = "number list has some invalid destinations";
                return fcallback(sms_body.err_msg);
            }
            total_credits += default_msg_credit;
        }
        updateList.push(mobile);
        fcallback();
    }, function (err_msg) {
        if (err_msg) {
            sms_body.err_msg = err_msg;
            return _callback(sms_body);
        }
        sms_body.list = _.clone(updateList);
        updateList = null;
        if (list_type == 'object') {
            sms_body.is_personalize = true;
        } else {
            if (sms_body.list.length != Object.keys(checkDup).length) {
                sms_body.err_msg = "numbers list have duplicate numbers.";
                return _callback(sms_body);
            }
        }
        sms_body.total_credits = total_credits;
        //sms_body.err_msg,sms_body.total_credits,sms_body.list,sms_body.list[i].destination
        return _callback(sms_body);
    });
    //endregion


}
utils.validateSmsRequestWithCallback = validateSmsRequestWithCallback;

//endregion

//region generate alphanumeric uuid of specific length

function randomString(length, chars) {
    chars += '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
}
function generateUUID(length) {
    var unique_id = uuid.v4().split('-').join('') + new Date().getTime();
    if (length < 4) {
        length = 4;
    }
    return randomString(length, unique_id);
}
utils.generateUUID = generateUUID;
// console.log("8 char uuid:", generateUUID(0));
// console.log("6 char uuid2:", generateUUID(1));
// var dupUuid = {};
// var total_uuid = 2000000;
// console.log("total_uuid:", total_uuid);
// for (var i = 0; i < total_uuid; i++) {
//     dupUuid[generateUUID(18)] = 1;
// }
// console.log("total_uuid:", total_uuid);
// console.log("total_generated:", Object.keys(dupUuid).length);
// console.log("total_duplicate:", total_uuid - Object.keys(dupUuid).length);

//endregion


function createDirectoryPath(basePath, foldersNestedList, callback) {
    var filePath = basePath;
    async.eachSeries(foldersNestedList, function (dirName, cb) {
        try {
            if (!_.isEmpty(dirName)) {
                filePath = filePath + "/" + dirName;
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath, 0o755);
                    fs.chmodSync(filePath, '755');
                }
            }
        } catch (e) {
            __logger.error("here error", e);
            return cb(e);
        }
        cb();
    }, function (err) {
        if (err) {
            __logger.error("Error in creating file upload directory", {err: err, basePath: basePath, foldersNestedList: foldersNestedList});
            callback(err, null);
        } else {
            __logger.debug("created file upload directory:", filePath);
            callback(null, filePath);
        }
    })
}
utils.createDirectoryPath = createDirectoryPath;

function extractHeloUrlPattern(camp_id, message) {
    //<http://h1o.in/xxxx>
    var is_url = false, pattern = null, err = true, domain = '';
    if (!_.isEmpty(message)) {
        err = false;
        if (message.indexOf('/xxxx>') >= 0) {
            try {
                var temp = message.split('/xxxx>')[0];
                domain = temp.split('<')[temp.split('<').length - 1];
                pattern = "<" + domain + "/xxxx>";
                is_url = true;
            } catch (e) {
                err = true;
                __logger.error('failed to extract url patten from, ', {m: extractHeloUrlPattern.name, camp_id: camp_id, msg: message});
            }
        }
    }
    else {
        __logger.warn('message content is empty, ', {m: extractHeloUrlPattern.name, camp_id: camp_id});
    }
    return {err: err, is_url: is_url, pattern: pattern, domain: domain};
}
utils.extractHeloUrlPattern = extractHeloUrlPattern;

function createPsnMessage(camp_id, message, psn_json_str) {
    var psn_json = null;
    if (!_.isEmpty(message) && !_.isEmpty(psn_json_str)) {
        try {
            if (typeof psn_json_str == 'object') {
                psn_json_str = JSON.stringify(psn_json_str);
            }
            if (typeof psn_json_str != 'string') {
                psn_json_str = psn_json_str.toString();
            }
            psn_json_str = psn_json_str.replace(/\\/g, "");
            psn_json = JSON.parse(psn_json_str) || null;
            if (psn_json && _.isObject(psn_json) && !_.isArray(psn_json)) {
                for (var key in psn_json) {
                    var pattern = "<" + key + ">";
                    message = message.replace(new RegExp(pattern, 'g'), psn_json[key]);
                }
            }
        }
        catch (e) {
            __logger.error('failed to create psn msg, ', {err: e, psn_json_str: psn_json_str, camp_id: camp_id, msg: message});
            return null;
        }
    } else {
        return null;
    }
    return message;
}
utils.createPsnMessage = createPsnMessage;

function validatePsnJsonStr(psn_json) {
    var psn_json_str = null;
    try {
        if (!_.isEmpty(psn_json)) {

            if (typeof psn_json == 'object') {
                psn_json_str = JSON.stringify(psn_json);
            }
            if (typeof psn_json != 'string') {
                psn_json_str = psn_json.toString();
            }
            psn_json_str = psn_json_str.replace(/\\/g, "");
            return psn_json_str;
        } else {
            return null;
        }
    }
    catch (e) {
        return null;
    }
}
utils.validatePsnJsonStr = validatePsnJsonStr;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

utils.getRandomInt = getRandomInt;

utils.create_directories = function (directory) {
    if (!fs.existsSync(directory)) {
        var sep = '/';
        var segments = directory.split(sep);
        var current = '';
        var i = 0;
        while (i < segments.length) {
            current = current + sep + segments[i];
            try {
                fs.statSync(current);
            } catch (e) {
                fs.mkdirSync(current);
            }
            i++;
        }
    }
};

utils.catch_err_log_exit = (err) => {
    __logger.error("error: ", err);
    process.exit(1)
};

utils.catch_err_log = (err) => {
    __logger.error("error: ", err);
};

utils.catch_err_res = (resp) => {
    const { res, err } = resp;

    return __util.send(res, {
        type: err['response_type'],
        data: err['data']
    })
};

utils.make_log_statement = (req, function_name) => {
    let action_by = "";
    try {
        action_by = req.user_config.user_id + "(" + req.user_config.company_id + ")";
    } catch(e) {
        action_by = "anonymous";
    }

    let input_data = "";
    if(!_.isEmpty(req.query)) {
        input_data += " Query - " + JSON.stringify(req.query);
    }
    if(!_.isEmpty(req.body)) {
        input_data += " Body - " + JSON.stringify(req.body);
    }
    __logger.info("-- Called " + function_name + " - by - " + action_by + " - with data - " + input_data);
};

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

utils.remove_element_from_array = (arr, element_list) => {
    for(let i in element_list) {
        arr.remove(element_list[i]);
    }

    return arr;
}
module.exports = utils;
