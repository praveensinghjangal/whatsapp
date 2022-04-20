const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
const __constants = require('../../../config/constants')
const TrimService = require('../../../lib/trimService/trim')
const trimInput = new TrimService()
const __logger = require('../../../lib/logger')

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
          minLength: 1,
          maxLength: 50
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
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
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
          minLength: 6,
          maxLength: 15,
          pattern: __constants.VALIDATOR.number
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
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
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
          minLength: 6,
          maxLength: 15,
          pattern: __constants.VALIDATOR.number
        },
        channel: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 30
        },
        optinSourceId: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        segmentId: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        chatFlowId: {
          type: 'string',
          required: false,
          maxLength: 50
        },
        name: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        email: {
          type: 'string',
          required: false,
          minLength: 1,
          pattern: __constants.VALIDATOR.email
        },
        gender: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 20
        },
        country: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 60
        },
        countryCode: {
          type: 'string',
          required: false,
          default: __constants.DEFAULT_COUNTRY_CODE,
          enum: __constants.COUNTRY_LIST_ALPHA_TWO
        },
        isFacebookVerified: {
          type: 'boolean',
          required: false,
          default: false
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
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
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
          minLength: 6,
          maxLength: 15,
          pattern: __constants.VALIDATOR.number
        },
        channel: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 30
        },
        optinSourceId: {
          type: 'string',
          required: false,
          maxLength: 50
        },
        segmentId: {
          type: 'string',
          required: false,
          maxLength: 50
        },
        chatFlowId: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        name: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        email: {
          type: 'string',
          required: false,
          minLength: 1,
          pattern: __constants.VALIDATOR.email
        },
        gender: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 20
        },
        country: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 60
        },
        countryCode: {
          type: 'string',
          required: false,
          default: __constants.DEFAULT_COUNTRY_CODE,
          enum: __constants.COUNTRY_LIST_ALPHA_TWO
        },
        isFacebookVerified: {
          type: 'boolean',
          required: false,
          default: false
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
      __logger.info('Error', formatedError)
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
    }
    return isvalid.promise
  }

  checkOptinInput (request) {
    const isvalid = q.defer()

    const schema = {
      id: '/checkOptinInput',
      type: 'object',
      required: true,
      properties: {
        phoneNumber: {
          type: 'string',
          required: true,
          minLength: 6,
          maxLength: 15,
          pattern: __constants.VALIDATOR.number
        },
        optinSourceId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        },
        channel: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 30
        }

      }
    }

    const formatedError = []
    v.addSchema(schema, '/checkOptinInput')
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

  // segment

  checkSegmentId (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/checkSegmentId',
      type: 'object',
      required: true,
      additionalProperties: false,
      properties: {
        segmentId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/checkSegmentId')
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

  checkAddSegmentData (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/addSegment',
      type: 'object',
      required: true,
      properties: {
        segmentName: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/addSegment')
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

  checkUpdateSegmentData (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/updateSegment',
      type: 'object',
      required: true,
      properties: {
        segmentId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        },
        segmentName: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/updateSegment')
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

  checkOptinSourceId (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/checkOptinSourceId',
      type: 'object',
      required: true,
      additionalProperties: false,
      properties: {
        optinSourceId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/checkOptinSourceId')
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

  checkAddOptinSourceData (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/addOptin',
      type: 'object',
      required: true,
      properties: {
        optinSource: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/addOptin')
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

  checkUpdateOptinSourceData (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/updateOptin',
      type: 'object',
      required: true,
      properties: {
        optinSourceId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        },
        optinSource: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/updateOptin')
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
          minLength: 1,
          maxLength: 12
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

  audienceFilterParamCheck (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/audienceFilterParamCheck',
      type: 'object',
      required: true,
      properties: {
        channel: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        optinSourceId: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        segmentId: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        }
        // phoneNumber: {
        //   type: 'string',
        //   required: false,
        //   minLength: 1,
        //   maxLength: 15,
        //   pattern: __constants.VALIDATOR.phoneNumberWithPhoneCode
        // }

      }
    }
    const formatedError = []
    v.addSchema(schema, '/audienceFilterParamCheck')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      const patternError = formatedErr && formatedErr[1] && formatedErr[1].includes('pattern')
      const date = patternError && formatedErr[1].includes('startDate') ? 'startDate' : 'endDate'
      if (patternError && (formatedErr[1].includes('startDate') || formatedErr[1].includes('endDate'))) {
        formatedErr[1] = date + ' -invalid date format- use yyyy-mm-dd hh:MM:ss'
      }
      if (patternError && (formatedErr[1].includes('phoneNumber'))) {
        formatedErr[1] = '-invalid phone number format-use +XX XXXXXXXXXX'
      }
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      if (request.startDate && request.endDate && request.startDate === request.endDate) {
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
}

module.exports = validate
