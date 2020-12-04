const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const __constants = require('../../../config/constants')
const v = new Validator()

class checkCompleteIncomplete {
  // Business Profile Validation Schema
  validateBusinessProfile (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/businessProfileApi',
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
          type: 'boolean'
        },
        canReceiveVoiceCall: {
          type: 'boolean'
        },
        associatedWithIvr: {
          type: 'boolean'
        },
        businessManagerVerified: {
          type: 'boolean'
        },
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
        email: {
          type: 'string',
          required: true,
          minLength: 1,
          pattern: __constants.VALIDATOR.email
        },
        businessCategory: {
          type: 'string',
          required: true,
          minLength: 1
        },
        // profilePhotoUrl: {
        //   type: 'string',
        //   required: true,
        //   minLength: 1
        // },
        city: {
          type: 'string',
          required: true,
          minLength: 1
        },
        postalCode: {
          type: 'string',
          required: true,
          minLength: 6,
          maxLength: 6,
          pattern: __constants.VALIDATOR.number
        }
      }
    }
    const formatedError = []
    const formatedFieldError = []
    v.addSchema(schema, '/businessProfileApi')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      const reFromatedErr = formatedErr[formatedErr.length - 1].split(' ')
      formatedError.push(formatedErr[formatedErr.length - 1])
      formatedFieldError.push(reFromatedErr[0])
    })
    if (formatedError.length > 0) {
      isvalid.resolve({ complete: false, err: formatedError, fieldErr: formatedFieldError, canReceiveSms: request.canReceiveSms, canReceiveVoiceCall: request.canReceiveVoiceCall, associatedWithIvr: request.associatedWithIvr })
    } else {
      if (request && (!request.canReceiveSms || !request.canReceiveVoiceCall || request.associatedWithIvr)) {
        isvalid.resolve({ complete: false, canReceiveSms: request.canReceiveSms, canReceiveVoiceCall: request.canReceiveVoiceCall, associatedWithIvr: request.associatedWithIvr, businessManagerVerified: request.businessManagerVerified })
      }
      if (request && request.canReceiveSms && request.canReceiveVoiceCall) {
        isvalid.resolve({ complete: true })
      }
    }
    return isvalid.promise
  }

  // Business Profile Verification

  validateBusinessProfileVerification (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/validateBusinessProfileVerificationApi',
      type: 'object',
      required: true,
      properties: {
        business_manager_verified: {
          type: 'boolean',
          required: true
        }
      }
    }
    const formatedError = []
    const formatedFieldError = []
    v.addSchema(schema, '/validateBusinessProfileVerificationApi')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      const reFromatedErr = formatedErr[formatedErr.length - 1].split(' ')
      formatedError.push(formatedErr[formatedErr.length - 1])
      formatedFieldError.push(reFromatedErr[0])
    })
    if (formatedError.length > 0) {
      isvalid.resolve({ complete: false, err: formatedError, fieldErr: formatedFieldError })
    } else {
      isvalid.resolve({ complete: true })
    }
    return isvalid.promise
  }
}

module.exports = checkCompleteIncomplete
