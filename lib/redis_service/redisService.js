const q = require('q')
const _ = require('lodash')
const __db = require('../db')
const __constants = require('../../config/constants')
const __logger = require('../logger')
const queryProvider = require('./queryProvider')
const rejectionHandler = require('../util/rejectionHandler')
const { getTemplateIdData } = require('../../app_modules/front_end/controllers/optinAndTemplate')
const e164 = require('e164')
const csc = require('country-state-city').default
const phoneCodeAndPhoneSeprator = require('../util/phoneCodeAndPhoneSeprator')
const TemplateService = require('../../app_modules/templates/services/dbData')

class RedisService {
    constructor () {
        __logger.warn('redisService: RediSerivce class Initiated...')
        this.WabaService = require('../../app_modules/whatsapp_business/services/businesAccount')
    }

    getWabaDataByPhoneNumber (wabaNumber) {
        __logger.info('redisService: getWabaDataByPhoneNumber(' + wabaNumber + '): Getting Waba Data By Phone Number ...')
        const dataFetched = q.defer()
        __db.redis.get(wabaNumber)
            .then(data => {
                if (data && data.serviceProviderId && data.apiKey && data.userAccountIdByProvider && data.wabizUsername && data.wabizPassword && data.wabizApiKeyExpiresOn && data.wabizBaseUrl && data.graphApiKey && data.maxTpsToProvider && data.wabaInformationId) {
                    data = JSON.parse(data)
                    return data
                } else {
                    // if (wabaNumber.includes('91')) {
                    //     wabaNumber = wabaNumber.substring(2, wabaNumber.length)
                    // }
                    // if (wabaNumber.includes('+91')) {
                    //     wabaNumber = wabaNumber.substring(3, wabaNumber.length)
                    // }
                    const countryNumDetails = e164.lookup(wabaNumber)
                    const countryDetails = countryNumDetails && countryNumDetails.code ? csc.getCountryByCode(countryNumDetails.code.toUpperCase()) : {}
                    const phoneCode = wabaNumber.includes('+') ? '+' + countryDetails.phonecode : countryDetails.phonecode
                    wabaNumber = wabaNumber.substring(phoneCode.length, wabaNumber.length)
                    return this.setDataInRedis(wabaNumber)
                }
            })
            .then(data => dataFetched.resolve(data))
            .catch(err => {
                __logger.error('redisService: getWabaDataByPhoneNumber(' + wabaNumber + '): catch:', err)
                dataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
            })
        return dataFetched.promise
    }

    setDataInRedis (wabaNumber) {
        const dataUploaded = q.defer()
        const wabaService = new this.WabaService()
        let dataObj = {}
        wabaService.getWabaDataFromDb(wabaNumber)
            .then(data => {
                __logger.info('redisService: setDataInRedis(' + wabaNumber + '): setting new redis data ...........');
                dataObj = data
                return __db.redis.setex(dataObj.id, JSON.stringify(dataObj), __constants.REDIS_TTL.wabaData)
            })
            .then(data => dataUploaded.resolve(dataObj))
            .catch(err => {
                __logger.error('redisService: SetDatainRedis(' + wabaNumber + '): getWabaDataFromDb(): catch:', err)
                dataUploaded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
            })
        return dataUploaded.promise
    }

    getTemplateDataByIdAndPhoneNumber (inputTemplateData) {
        const dataFetched = q.defer()
        __db.redis.get(inputTemplateData)
            .then(redisData => {
                if (redisData) {
                    redisData = JSON.parse(redisData)
                    return { redisData, firstAttemp: true }
                } else {
                    const phoneAndTemplateSplitted = inputTemplateData.split('___')
                    return this.setTemplatesInRedisForWabaPhoneNumber(phoneCodeAndPhoneSeprator(phoneAndTemplateSplitted[1]).phoneNumber)
                }
            })
            .then(data => {
                if (data && data.firstAttemp) {
                    dataFetched.resolve(data.redisData)
                } else {
                    const inputArr = inputTemplateData.split('___')
                    const templateData = _.find(data, { templateId: inputArr[0], phoneNumber: inputArr[1] })
                    if (templateData) {
                        dataFetched.resolve(templateData)
                    } else {
                        __logger.error('redisService: getTemplateDataByIdAndPhoneNumber(): then 2: No template id found :: Reject ::', templateData)
                        dataFetched.reject({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_ID_NOT_EXISTS, err: {}, data: {} })
                    }
                }
            })
            .catch(err => {
                __logger.error('redisService: getWabaDataByPhoneNumber(' + wabaNumber + '): catch:', err)
                dataFetched.reject(err)
            })
        return dataFetched.promise
    }

    setTemplatesInRedisForWabaPhoneNumber (wabaPhoneNumber) {
        __logger.info('redisService: setTemplatesInRedisForWabaPhoneNumber(' + wabaPhoneNumber + ')')
        const dataStored = q.defer()
        __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.setTemplatesInRedisForWabaPhoneNumber(), [wabaPhoneNumber])
            .then(result => {
                if (result && result.length === 0) {
                    __logger.info('redisService: setTemplatesInRedisForWabaPhoneNumber(' + wabaPhoneNumber + '): DB Query :: Reject ::', result)
                    return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
                } else {
                    return result
                }
            })
            .then(dbData => {
                // todo : replace service with single template insert in redis to optimize
                __logger.info('redisService: setTemplatesInRedisForWabaPhoneNumber(' + wabaPhoneNumber + '):', dbData)
                const resolveData = []
                _.each(dbData, singleObj => {
                    const dataObject = {
                        templateId: singleObj.message_template_id,
                        headerParamCount: singleObj.header_text ? (singleObj.header_text.match(/{{\d{1,2}}}/g) || []).length : 0,
                        bodyParamCount: singleObj.body_text ? (singleObj.body_text.match(/{{\d{1,2}}}/g) || []).length : 0,
                        footerParamCount: singleObj.footer_text ? (singleObj.footer_text.match(/{{\d{1,2}}}/g) || []).length : 0,
                        phoneNumber: singleObj.phone_number
                    }
                    dataObject.approvedLanguages = []
                    if (singleObj.first_localization_status === __constants.TEMPLATE_APPROVE_STATUS) dataObject.approvedLanguages.push(singleObj.first_language_code)
                    if (singleObj.second_localization_status === __constants.TEMPLATE_APPROVE_STATUS) dataObject.approvedLanguages.push(singleObj.second_language_code)
                    if (singleObj.header_type && singleObj.header_type !== 'text') dataObject.headerParamCount = dataObject.headerParamCount + 1
                    resolveData.push(dataObject)
                    __db.redis.setex(dataObject.templateId + '___' + dataObject.phoneNumber, JSON.stringify(dataObject), __constants.REDIS_TTL.templateData)
                })
                dataStored.resolve(resolveData)
            })
            .catch(err => {
                __logger.error('redisService: setTemplatesInRedisForWabaPhoneNumber(' + wabaPhoneNumber + '): catch:', err)
                dataStored.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
            })
        return dataStored.promise
    }

    setFacebookAuthKeysInRedis (tokenData, wabaNumber, serviceProviderId, userId) {
        const dataInRedis = q.defer()
        const token = __constants.FB_REDIS_KEY_FOLDER
        const tokenExpiry = __constants.FB_REDIS_TOKEN_EXPIRY_KEY

        __db.redis.setex(`${token}${wabaNumber}`, JSON.stringify(tokenData), Math.ceil(tokenData.timeLeftToExpire / 1000)) // divide by 1000 to convert ms to second
            .then(data => __db.redis.setex(`${tokenExpiry}${wabaNumber}__${serviceProviderId}__${userId}`, '1', Math.ceil((tokenData.timeLeftToExpire - __constants.FB_REDIS_KEY_BUFFER_TIME + 1000) / 1000))) // adding 1 second so that when this key expires the calling func in fb integration layer always gets condition of < buffer as true)
            .then(data => dataInRedis.resolve(tokenData))
            .catch(err => {
                __logger.error('redisService: setFacebookAuthKeysInRedis(' + wabaNumber + '): catch:', err)
                return dataInRedis.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
            })
        return dataInRedis.promise
    }

    getFacebookAuthKeys (wabaNumber) {
        __logger.info('redisService: getFacebookAuthKeys(' + wabaNumber + '):')
        const dataFetched = q.defer()
        const token = __constants.FB_REDIS_KEY_FOLDER
        __db.redis.get(`${token}${wabaNumber}`)
            .then(data => {
                if (data) {
                    __logger.info('redisService: getFacebookAuthKeys(' + wabaNumber + '): Redis Data Found:')
                    return JSON.parse(data)
                } else {
                    __logger.error('redisService: getFacebookAuthKeys(' + wabaNumber + '): Redis Data Not Found:')
                    return false
                }
            })
            .then(data => dataFetched.resolve(data))
            .catch(err => {
                __logger.error('redisService: getFacebookAuthKeys(' + wabaNumber + '): catch:', err)
                dataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
            })
        return dataFetched.promise
    }

    getOptinTemplateFromRedis (redisKey) {
        const statusMappingData = q.defer()
        __db.redis.get(redisKey)
            .then(data => {
                if (data) {
                    statusMappingData.resolve({ exists: true, data: JSON.parse(data) })
                } else {
                    statusMappingData.resolve({ exists: false, data: {} })
                }
            })
            .catch(err => {
                __logger.error('redisService: getWabaDataByPhoneNumber(' + wabaNumber + '): catch:', err)
                statusMappingData.reject(err)
            })
        return statusMappingData.promise
    }

    setOptinTemplateInRedis (redisKey, authToken) {
        const dataSet = q.defer()
        let statusData = {}
        // api call to get the template from chat module.
        getTemplateIdData (authToken)
            .then(metaData => {
                statusData = metaData.data
                return __db.redis.setex(redisKey, JSON.stringify(metaData.data), __constants.REDIS_TTL.optinTemplateData)
            })
            .then(result => dataSet.resolve(statusData))
            .catch(err => {
                __logger.error('redisService: setOptinTemplateInRedis(): catch:', err)
                dataSet.reject(err)
            })
        return dataSet.promise
    }

    getOptinTemplateId (wabaPhoneNumber, authToken) {
        const platformStatus = q.defer()
        this.getOptinTemplateFromRedis (__constants.REDIS_OPTIN_TEMPLATE_DATA_KEY + wabaPhoneNumber)
            .then(redisData => {
                if (redisData.exists) {
                    return redisData.data
                } else {
                    return this.setOptinTemplateInRedis(__constants.REDIS_OPTIN_TEMPLATE_DATA_KEY + wabaPhoneNumber, authToken)
                }
            })
            .then(redisData => platformStatus.resolve(redisData))
            .catch(err => {
                __logger.error('redisService: getOptinTemplateId(' + wabaPhoneNumber + '): catch:', err)
                platformStatus.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
            })
        return platformStatus.promise
    }

    setWabaDataInRedis (wabaNumber, data) {
        const dataInRedis = q.defer()
        __db.redis.setex(wabaNumber, JSON.stringify(data), __constants.REDIS_TTL.wabaData)
            .then(data => dataInRedis.resolve(data))
            .catch(err => {
                __logger.error('redisService: setWabaDataInRedis(' + wabaNumber + '): catch:', err)
                return dataInRedis.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
            })
        return dataInRedis.promise
    }

    getFbTemplateName (templateid) {
        const dataFetched = q.defer()
        __db.redis.get(__constants.FB_TEMPLATE_REDIS_KEY_FOLDER + templateid)
            .then(data => {
                if (data) {
                    return data
                } else {
                    return this.setFbTemplateName(templateid)
                }
            })
            .then(data => {
                dataFetched.resolve(data)
            })
            .catch(err => {
                __logger.error('redisService: getFbTemplateName(' + templateid + '): catch:', err)
                dataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
            })
        return dataFetched.promise
    }

    setFbTemplateName (templateid) {
        const nameSetted = q.defer()
        const templateService = new TemplateService()
        let facebookName = ''
        templateService.getFbTemplateName(templateid)
            .then(data => {
                facebookName = data[0].facebookMessageTemplateId
                return __db.redis.setex(__constants.FB_TEMPLATE_REDIS_KEY_FOLDER + templateid, facebookName, __constants.REDIS_TTL.fbtemplateName)
            })
            .then(data => nameSetted.resolve(facebookName))
            .catch(err => {
                __logger.error('redisService: setFbTemplateName(' + templateid + '): catch:', err)
                nameSetted.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
            })
        return nameSetted.promise
    }

    setStaticTemplateForInternalUse (wabaNumber, audienceNumber, messageId) {
        const dataInRedis = q.defer()
        const namespace = __constants.STATIC_TEMPLATE_FOR_INTERNAL_USED_FOLDER
        __db.redis.setex(`${namespace}:${wabaNumber}__${audienceNumber}`, JSON.stringify(messageId), __constants.FB_REDIS_KEY_STATIC_TEMPLATE_SET_TIME)
            .then(data => dataInRedis.resolve(true))
            .catch(err => {
                __logger.error('redisService: setStaticTemplateForInternalUse(' + wabaNumber + '): catch:', err)
                dataInRedis.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
            })
        return dataInRedis.promise
    }
}

module.exports = RedisService