const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
const __define = require('../../../config/define')

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
          minLength: 1
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
      isvalid.reject({ type: __define.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
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
        },
        password: {
          type: 'string',
          required: true,
          minLength: 1
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
      isvalid.reject({ type: __define.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      isvalid.resolve(request)
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
          minLength: 1
        },
        password: {
          type: 'string',
          required: true,
          minLength: 1
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
      isvalid.reject({ type: __define.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      isvalid.resolve(request)
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
      isvalid.reject({ type: __define.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      isvalid.resolve(request)
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
        // email: {
        //   type: 'string',
        //   required: true,
        //   minLength: 1
        // },
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
        country: {
          type: 'string',
          required: true,
          minLength: 1
        },
        addressLine1: {
          type: 'string',
          required: true,
          minLength: 1
        },
        addressLine2: {
          type: 'string',
          required: true,
          minLength: 1
        },
        contactNumber: {
          type: 'string',
          required: true,
          minLength: 10
        },
        phoneCode: {
          type: 'string',
          required: true,
          minLength: 1
        },
        postalCode: {
          type: 'string',
          required: true,
          minLength: 6
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
      isvalid.reject({ type: __define.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      isvalid.resolve(request)
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
        businessName: {
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
        country: {
          type: 'string',
          required: true,
          minLength: 1
        },
        addressLine1: {
          type: 'string',
          required: true,
          minLength: 1
        },
        addressLine2: {
          type: 'string',
          required: true,
          minLength: 1
        },
        contactNumber: {
          type: 'string',
          required: true,
          minLength: 10
        },
        phoneCode: {
          type: 'string',
          required: true,
          minLength: 1
        },
        postalCode: {
          type: 'string',
          required: true,
          minLength: 5
        },
        GstOrTaxNo: {
          type: 'string',
          required: true,
          minLength: 5
        },
        panCard: {
          type: 'string',
          required: true,
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
      isvalid.reject({ type: __define.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      isvalid.resolve(request)
    }
    return isvalid.promise
  }
}

module.exports = validate
