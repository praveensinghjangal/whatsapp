const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
const __constants = require('../../../config/constants')

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
          minLength: 1
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
      isvalid.resolve(request)
    }
    return isvalid.promise
  }

  // Business Access Info Validation Schema

  checkCompleteBusinessInfo (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/businessAccessInfoApi',
      type: 'object',
      required: true,
      properties: {
        facebookManagerId: {
          type: 'string',
          required: true,
          minLength: 1
        },
        phoneCode: {
          type: 'string',
          required: false,
          minLength: 1
        },
        phoneNumber: {
          type: 'string',
          required: false,
          minLength: 1
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
        },
        businessName: {
          type: 'string',
          required: false,
          minLength: 1
        },
        whatsappStatus: {
          type: 'string',
          required: false,
          minLength: 1
        },
        description: {
          type: 'string',
          required: false,
          minLength: 1
        },
        address: {
          type: 'string',
          required: false,
          minLength: 1
        },
        country: {
          type: 'string',
          required: false,
          minLength: 1
        },
        email: {
          type: 'string',
          required: false,
          minLength: 1
        },
        businessCategory: {
          type: 'string',
          required: false,
          minLength: 1
        },
        profilePhotoUrl: {
          type: 'string',
          required: false,
          minLength: 1
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
      isvalid.resolve(request)
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
          minLength: 1
        },
        whatsappStatus: {
          type: 'string',
          required: false,
          minLength: 1
        },
        description: {
          type: 'string',
          required: false,
          minLength: 1
        },
        address: {
          type: 'string',
          required: false,
          minLength: 1
        },
        country: {
          type: 'string',
          required: false,
          minLength: 1
        },
        city: {
          type: 'string',
          required: false,
          minLength: 1
        },
        state: {
          type: 'string',
          required: false,
          minLength: 1
        },
        postalCode: {
          type: 'string',
          required: false,
          minLength: 1
        },
        email: {
          type: 'string',
          required: false,
          minLength: 1
        },
        businessCategoryId: {
          type: 'string',
          required: false,
          minLength: 1
        },
        profilePhotoUrl: {
          type: 'string',
          required: false,
          minLength: 1
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
      isvalid.resolve(request)
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
          minLength: 1
        },
        whatsappStatus: {
          type: 'string',
          required: true,
          minLength: 1
        },
        description: {
          type: 'string',
          required: true,
          minLength: 1
        },
        address: {
          type: 'string',
          required: true,
          minLength: 1
        },
        country: {
          type: 'string',
          required: true,
          minLength: 1
        },
        city: {
          type: 'string',
          required: true,
          minLength: 1
        },
        state: {
          type: 'string',
          required: true,
          minLength: 1
        },
        postalCode: {
          type: 'string',
          required: true,
          minLength: 1
        },
        email: {
          type: 'string',
          required: true,
          minLength: 1
        },
        businessCategoryId: {
          type: 'string',
          required: true,
          minLength: 1
        },
        profilePhotoUrl: {
          type: 'string',
          required: true,
          minLength: 1
        }
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
}

module.exports = validate
