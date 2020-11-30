const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
const __constants = require('../../../config/constants')
const TrimService = require('../../../lib/trimService/trim')
const trimInput = new TrimService()

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
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
    }
    return isvalid.promise
  }

  checkServiceProviderIdService (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/checkServiceProviderIdService',
      type: 'object',
      required: true,
      properties: {
        serviceProviderId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/checkServiceProviderIdService')
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
          minLength: 2,
          maxLength: 2,
          pattern: __constants.VALIDATOR.number
        },
        phoneNumber: {
          type: 'string',
          required: true,
          minLength: 10,
          maxLength: 10,
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
        phoneCode: {
          type: 'string',
          required: false,
          minLength: 2,
          maxLength: 2,
          pattern: __constants.VALIDATOR.number
        },
        phoneNumber: {
          type: 'string',
          required: false,
          minLength: 10,
          maxLength: 10,
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
          required: true,
          minLength: 1,
          maxLength: 80
        },
        whatsappStatus: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 500
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
          maxLength: 8,
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
        webHookPostUrl: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 300
        },
        optinText: {
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

  isAddUpdateBusinessInfoComplete (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/isAddUpdateBusinessInfoComplete',
      type: 'object',
      required: true,
      properties: {
        businessName: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 80
        },
        whatsappStatus: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 500
        },
        description: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 1000
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
          maxLength: 8,
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
        phoneCode: {
          type: 'string',
          required: true,
          minLength: 2,
          maxLength: 2,
          pattern: __constants.VALIDATOR.number
        },
        phoneNumber: {
          type: 'string',
          required: true,
          minLength: 10,
          maxLength: 10,
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
}

module.exports = validate
