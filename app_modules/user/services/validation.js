const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
const __constants = require('../../../config/constants')
const TrimService = require('../../../lib/trimService/trim')
const trimInput = new TrimService()

class validate {
  login (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/loginAPi',
      type: 'object',
      required: true,
      properties: {
        email: {
          type: 'string',
          required: true,
          minLength: 1,
          pattern: __constants.VALIDATOR.email

        },
        password: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/loginAPi')
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

  signup (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/signupAPi',
      type: 'object',
      required: true,
      properties: {
        email: {
          type: 'string',
          required: true,
          unique: true,
          minLength: 1
          // pattern: __constants.VALIDATOR.email

        },
        password: {
          type: 'string',
          required: true,
          minLength: 1,
          trim: true
        },
        tncAccepted: {
          type: 'boolean',
          required: true
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/signupAPi')
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

  signupService (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/signupService',
      type: 'object',
      required: true,
      properties: {
        email: {
          type: 'string',
          required: true,
          unique: true,
          minLength: 1,
          pattern: __constants.VALIDATOR.email

        },
        password: {
          type: 'string',
          required: true,
          minLength: 1
        },
        tncAccepted: {
          type: 'boolean',
          required: true
        },
        source: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/signupService')
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
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
    }
    return isvalid.promise
  }

  // Account Profile Validation Schema

  accountProfile (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/accountProfileApi',
      type: 'object',
      required: true,
      properties: {
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
        country: {
          type: 'string',
          required: false,
          minLength: 1
        },
        addressLine1: {
          type: 'string',
          required: false,
          minLength: 1
        },
        addressLine2: {
          type: 'string',
          required: false,
          minLength: 1
        },
        contactNumber: {
          type: 'string',
          required: false,
          minLength: 10,
          maxLength: 10,
          pattern: __constants.VALIDATOR.number
        },
        phoneCode: {
          type: 'string',
          required: false,
          minLength: 2,
          maxLength: 2,
          pattern: __constants.VALIDATOR.number

        },
        postalCode: {
          type: 'string',
          required: false,
          minLength: 6,
          maxLength: 8,
          pattern: __constants.VALIDATOR.number

        },
        firstName: {
          type: 'string',
          required: false,
          minLength: 1
        },
        lastName: {
          type: 'string',
          required: false,
          minLength: 1
        },
        accountManagerName: {
          type: 'string',
          required: false,
          minLength: 1
        },
        accountTypeId: {
          type: 'string',
          required: false,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/accountProfileApi')
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

  // Business Profile Validation Schema

  businessProfile (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/businessProfileApi',
      type: 'object',
      required: true,
      properties: {
        billingName: {
          type: 'string',
          required: true,
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
        country: {
          type: 'string',
          required: false,
          minLength: 1
        },
        addressLine1: {
          type: 'string',
          required: false,
          minLength: 1
        },
        addressLine2: {
          type: 'string',
          required: false,
          minLength: 1
        },
        contactNumber: {
          type: 'string',
          required: false,
          minLength: 10,
          maxLength: 10,
          pattern: __constants.VALIDATOR.number
        },
        phoneCode: {
          type: 'string',
          required: false,
          minLength: 2,
          maxLength: 2,
          pattern: __constants.VALIDATOR.number

        },
        postalCode: {
          type: 'string',
          required: false,
          minLength: 6,
          maxLength: 8,
          pattern: __constants.VALIDATOR.number

        },
        gstOrTaxNo: {
          type: 'string',
          required: false,
          minLength: 5
        },
        panCard: {
          type: 'string',
          required: false,
          minLength: 10
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/businessProfileApi')
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

  authorize (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/authorize',
      type: 'object',
      required: true,
      properties: {
        apiKey: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/authorize')
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

  forgotPassword (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/forgotPassword',
      type: 'object',
      required: true,
      properties: {
        email: {
          type: 'string',
          required: true,
          minLength: 1,
          pattern: __constants.VALIDATOR.email
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/forgotPassword')
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

  changePassword (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/changePassword',
      type: 'object',
      required: true,
      properties: {
        newPassword: {
          type: 'string',
          required: true,
          minLength: 1
        },
        token: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/changePassword')
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
