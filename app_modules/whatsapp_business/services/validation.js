const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
const __constants = require('../../../config/constants')
const TrimService = require('../../../lib/trimService/trim')
const trimInput = new TrimService()
const __logger = require('../../../lib/logger')

class validate {
  checkUserIdService (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/checkUserIdService',
      type: 'object',
      required: true,
      properties: {
        userId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/checkUserIdService')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      __logger.error('whatsapp_business.serivces.validation: formatedErr:', formatedError)
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
    }
    return isvalid.promise
  }

  updateServiceProviderDetails (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/updateServiceProviderDetails',
      type: 'object',
      required: true,
      properties: {
        serviceProviderId: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        userId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        },
        apiKey: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 500
        },
        serviceProviderUserAccountId: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 500
        },
        maxTpsToProvider: {
          type: 'number',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/updateServiceProviderDetails')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
    }
    return isvalid.promise
  }

  checkPhoneCodeAndPhoneNumberService (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/checkPhoneCodeAndPhoneNumberService',
      type: 'object',
      required: true,
      properties: {
        phoneCode: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 4,
          pattern: __constants.VALIDATOR.number
        },
        phoneNumber: {
          type: 'string',
          required: true,
          minLength: 6,
          maxLength: 15,
          pattern: __constants.VALIDATOR.number
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/checkPhoneCodeAndPhoneNumberService')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
    }
    return isvalid.promise
  }
  // Business Access Info Validation Schema

  businessAccessInfo (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/businessAccessInfoApi',
      type: 'object',
      required: true,
      additionalProperties: false,
      properties: {
        facebookManagerId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 100
        },
        businessName: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 80
        },
        phoneCode: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 4,
          pattern: __constants.VALIDATOR.number
        },
        phoneNumber: {
          type: 'string',
          required: false,
          minLength: 6,
          maxLength: 15,
          pattern: __constants.VALIDATOR.number
        },
        canReceiveSms: {
          type: 'boolean',
          required: false
        },
        canReceiveVoiceCall: {
          type: 'boolean',
          required: false
        },
        associatedWithIvr: {
          type: 'boolean',
          required: false
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/businessAccessInfoApi')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
    }
    return isvalid.promise
  }

  addUpdateBusinessInfo (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/addUpdateBusinessInfo',
      type: 'object',
      required: true,
      additionalProperties: false,
      properties: {
        businessName: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 80
        },
        whatsappStatus: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 150
        },
        description: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 1000
        },
        address: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 1000
        },
        country: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 100
        },
        city: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 60
        },
        state: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        postalCode: {
          type: 'string',
          required: false,
          minLength: 6,
          maxLength: 6,
          pattern: __constants.VALIDATOR.number
        },
        email: {
          type: 'string',
          required: false,
          minLength: 1,
          pattern: __constants.VALIDATOR.email

        },
        businessCategoryId: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 100
        },
        // profilePhotoUrl: {
        //   type: 'string',
        //   required: false,
        //   minLength: 1
        // },
        serviceProviderId: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        apiKey: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 500
        },
        webhookPostUrl: {
          type: 'string',
          required: false,
          maxLength: 2048,
          pattern: request.webhookPostUrl === '' ? '' : __constants.VALIDATOR.url
        },
        audienceWebhookUrl: {
          type: 'string',
          required: false,
          maxLength: 2048,
          pattern: request.audienceWebhookUrl === '' ? '' : __constants.VALIDATOR.url
        },
        optinText: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 20
        },
        optoutText: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 20
        },
        chatBotActivated: {
          type: 'boolean',
          required: false
        },
        serviceProviderUserAccountId: {
          type: 'string',
          required: false
        },
        websites: {
          type: 'array',
          required: false
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/addUpdateBusinessInfo')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      if (err.split('instance.webhookPostUrl does not match pattern').length > 1) {
        formatedError.push(__constants.RESPONSE_MESSAGES.INVALID_URL.message + '- webhookPostUrl')
      } else if (err.split('instance.audienceWebhookUrl does not match pattern').length > 1) {
        formatedError.push(__constants.RESPONSE_MESSAGES.INVALID_URL.message + '- audienceWebhookUrl')
      } else {
        formatedError.push(formatedErr[formatedErr.length - 1])
      }
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
    }
    return isvalid.promise
  }

  isAddUpdateBusinessInfoComplete (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/isAddUpdateBusinessInfoComplete',
      type: 'object',
      required: true,
      properties: {
        businessName: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 80
        },
        whatsappStatus: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 150
        },
        description: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 250
        },
        address: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 1000
        },
        country: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 100
        },
        city: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 60
        },
        state: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        },
        postalCode: {
          type: 'string',
          required: true,
          minLength: 6,
          maxLength: 6,
          pattern: __constants.VALIDATOR.number
        },
        email: {
          type: 'string',
          required: true,
          minLength: 1,
          pattern: __constants.VALIDATOR.email
        },
        businessCategoryId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 100
        }
        // profilePhotoUrl: {
        //   type: 'string',
        //   required: true,
        //   minLength: 1
        // }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/isAddUpdateBusinessInfoComplete')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.resolve(false)
    } else {
      isvalid.resolve(true)
    }
    return isvalid.promise
  }

  isAddUpdateBusinessAccessInfoComplete (request, isBmRequired = true) {
    const isvalid = q.defer()
    const schema = {
      id: '/isAddUpdateBusinessAccessInfoComplete',
      type: 'object',
      required: true,
      properties: {
        facebookManagerId: {
          type: 'string',
          required: true
        },
        businessName: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 80
        },
        phoneCode: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 4,
          pattern: __constants.VALIDATOR.number
        },
        phoneNumber: {
          type: 'string',
          required: true,
          minLength: 6,
          maxLength: 15,
          pattern: __constants.VALIDATOR.number
        },
        canReceiveSms: {
          type: 'boolean',
          required: true
        },
        canReceiveVoiceCall: {
          type: 'boolean',
          required: true
        },
        associatedWithIvr: {
          type: 'boolean'
        },
        businessManagerVerified: {
          type: 'boolean',
          required: isBmRequired
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/isAddUpdateBusinessAccessInfoComplete')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.resolve({ complete: false, err: formatedError.length > 0 ? formatedError : 'Please make sure phone number entered can receive sms, call and the business manager is verified.' })
    } else {
      trimInput.singleInputTrim(request)
      if (request && (!request.canReceiveSms || !request.canReceiveVoiceCall || request.associatedWithIvr || !request.businessManagerVerified)) {
        isvalid.resolve({ complete: false, err: formatedError.length > 0 ? formatedError : 'Please make sure phone number entered can receive sms, call and the business manager is verified.' })
      } else {
        isvalid.resolve({ complete: true })
      }
    }
    return isvalid.promise
  }

  markManagerVerified (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/markManagerVerified',
      type: 'object',
      required: true,
      additionalProperties: false,
      properties: {
        businessManagerVerified: {
          type: 'boolean',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/markManagerVerified')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
    }
    return isvalid.promise
  }

  addUpdateOptinMessage (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/addUpdateOptinMessage',
      type: 'object',
      required: true,
      additionalProperties: false,
      properties: {
        optinText: {
          type: 'string',
          required: true,
          minLength: 1
        },
        optoutText: {
          type: 'string',
          required: false,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/addUpdateOptinMessage')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
    }
    return isvalid.promise
  }

  addUpdateBusinessAccessInfoInputCheck (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/addUpdateBusinessAccessInfoInputCheck',
      type: 'object',
      required: true,
      additionalProperties: false,
      properties: {
        wabaProfileSetupStatusId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        },
        accessInfoRejectionReason: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 500
        },
        userId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        }
      }
    }
    if (request.wabaProfileSetupStatusId === __constants.WABA_PROFILE_STATUS.rejected.statusCode) {
      schema.additionalProperties = true
      schema.properties.accessInfoRejectionReason.required = true
    }
    const formatedError = []
    v.addSchema(schema, '/addUpdateBusinessAccessInfoInputCheck')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
    }
    return isvalid.promise
  }

  checkWabaConfigurationInput (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/checkWabaConfigurationInput',
      type: 'object',
      required: true,
      additionalProperties: false,
      properties: {
        templatesAllowed: {
          type: 'number',
          required: true,
          minLength: 1
        },
        userId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        },
        serviceProviderId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        },
        apiKey: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 500
        },
        serviceProviderUserAccountId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 500
        },
        maxTpsToProvider: {
          type: 'number',
          required: true,
          minLength: 1
        },
        tps: {
          type: 'number',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/checkWabaConfigurationInput')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
    }
    return isvalid.promise
  }

  wabaNoMappingInputCheck (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/wabaNoMappingInputCheck',
      type: 'object',
      required: true,
      additionalProperties: false,
      properties: {
        wabaInformationId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        },
        wabaPhoneNumber: {
          type: 'string',
          required: true,
          minLength: 6,
          maxLength: 15
        },
        userId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/wabaNoMappingInputCheck')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
    }
    return isvalid.promise
  }

  getWabaProfileListByStatusId (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/getWabaProfileListByStatusId',
      type: 'object',
      required: true,
      properties: {
        statusId: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/getWabaProfileListByStatusId')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
      isvalid.resolve(request)
    }
    return isvalid.promise
  }

  getProfileDataByWabaId (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/getProfileByWabaId',
      type: 'object',
      required: true,
      properties: {
        wabaId: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/getProfileByWabaId')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
      isvalid.resolve(request)
    }
    return isvalid.promise
  }

  getTemplateAllocated (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/getTemplateAllocatedCount',
      type: 'object',
      required: true,
      properties: {
        userId: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/getTemplateAllocatedCount')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
      isvalid.resolve(request)
    }
    return isvalid.promise
  }

  getProfileListByStatusId (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/getProfileListByStatusId',
      type: 'object',
      required: true,
      properties: {
        startDate: {
          type: 'string',
          required: true,
          pattern: __constants.VALIDATOR.timeStamp,
          minLength: 1
        },
        endDate: {
          type: 'string',
          required: true,
          pattern: __constants.VALIDATOR.timeStamp,
          minLength: 1
        },
        statusId: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        phoneNumber: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 15,
          pattern: __constants.VALIDATOR.phoneNumberWithPhoneCode
        }
      }
    }

    const formatedError = []
    v.addSchema(schema, '/getProfileListByStatusId')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      const patternError = formatedErr && formatedErr[1] && formatedErr[1].includes('pattern')
      const date = patternError && formatedErr[1].includes('startDate') ? 'startDate' : 'endDate'

      if (patternError && (formatedErr[1].includes('startDate') || formatedErr[1].includes('endDate'))) {
        formatedErr[1] = date + ' -invalid date format- use yyyy-mm-dd hh:MM:ss'
      }
      if (patternError && formatedErr[1].includes('phoneNumber')) {
        formatedErr[1] = 'phoneNumber does not match pattern - please enter valid phone number'
      }
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      if (request.startDate === request.endDate) {
        formatedError.push('startDate cannot be equal to endDate!')
      }
      if (request.startDate > request.endDate) {
        formatedError.push('startDate can not be greater than endDate!')
      }
      if (formatedError.length > 0) {
        isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
      } else {
        trimInput.singleInputTrim(request)
        request.startDate = decodeURI(request.startDate)
        request.endDate = decodeURI(request.endDate)
        isvalid.resolve(request)
      }
    }
    return isvalid.promise
  }

  toggleChatbot (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/updateServiceProviderDetails',
      type: 'object',
      required: true,
      properties: {
        userId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        },
        chatBotActivated: {
          type: 'boolean',
          required: true
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/updateServiceProviderDetails')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
    }
    return isvalid.promise
  }

  serviceProviderValidation (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/serviceProviderValidation',
      type: 'object',
      required: true,
      properties: {
        serviceProviderId: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/serviceProviderValidation')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
    }
    return isvalid.promise
  }

  updateServiceProvider (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/updateServiceProviders',
      type: 'object',
      required: true,
      properties: {
        serviceProviderId: {
          type: 'string',
          required: true,
          minLength: 1
        },
        serviceProviderName: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 29
        },
        maxWebsiteAllowed: {
          type: 'number',
          required: false,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/updateServiceProvider')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (request && request.serviceProviderId && (!request.serviceProviderName && !request.maxWebsiteAllowed)) {
      formatedError.push('Please add the parameter in request body to update the service provider details eg :- serviceProviderName,maxWebsiteAllowed')
    }
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      isvalid.resolve({ update: true })
    }
    return isvalid.promise
  }

  addServiceProvider (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/addServiceProvider',
      type: 'object',
      required: true,
      properties: {
        serviceProviderName: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 29
        },
        maxWebsiteAllowed: {
          type: 'number',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/addServiceProvider')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (request && request.serviceProviderId) {
      formatedError.push('Please remove serviceProviderId from request body to insert service provider details')
    }
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      isvalid.resolve({ add: true })
    }
    return isvalid.promise
  }
}

module.exports = validate
