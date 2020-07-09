const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
const __constants = require('../../../config/constants')

class validate {
  checkAudienceIdExistService (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/checkAudienceIdExist',
      type: 'object',
      required: true,
      properties: {
        audienceId: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/checkAudienceIdExist')
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

  checkPhoneNumberExistService (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/checkPhoneNumberExist',
      type: 'object',
      required: true,
      properties: {
        phoneNumber: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/checkPhoneNumberExist')
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

  addAudience (request) {
    const isvalid = q.defer()

    const schema = {
      id: '/addAudienceData',
      type: 'object',
      required: true,
      properties: {
        phoneNumber: {
          type: 'string',
          required: true,
          minLength: 1
        },
        channel: {
          type: 'string',
          required: true,
          minLength: 1
        },
        optinSourceId: {
          type: 'string',
          required: false,
          minLength: 1
        },
        segmentId: {
          type: 'string',
          required: false,
          minLength: 1
        },
        chatFlowId: {
          type: 'string',
          required: false,
          minLength: 1
        },
        name: {
          type: 'string',
          required: false,
          minLength: 1
        },
        email: {
          type: 'string',
          required: false,
          minLength: 1
        },
        gender: {
          type: 'string',
          required: false,
          minLength: 1
        },
        country: {
          type: 'string',
          required: false,
          minLength: 1
        }

      }
    }

    const formatedError = []
    v.addSchema(schema, '/addAudienceData')
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

  updateAudience (request) {
    const isvalid = q.defer()

    const schema = {
      id: '/updateAudienceData',
      type: 'object',
      required: true,
      properties: {
        phoneNumber: {
          type: 'string',
          required: true,
          minLength: 1
        },
        channel: {
          type: 'string',
          required: true,
          minLength: 1
        },
        optinSourceId: {
          type: 'string',
          required: true,
          minLength: 1
        },
        segmentId: {
          type: 'string',
          required: true,
          minLength: 1
        },
        chatFlowId: {
          type: 'string',
          required: false,
          minLength: 1
        },
        name: {
          type: 'string',
          required: false,
          minLength: 1
        },
        email: {
          type: 'string',
          required: false,
          minLength: 1
        },
        gender: {
          type: 'string',
          required: false,
          minLength: 1
        },
        country: {
          type: 'string',
          required: false,
          minLength: 1
        }

      }
    }

    const formatedError = []
    v.addSchema(schema, '/updateAudienceData')
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
}

module.exports = validate
