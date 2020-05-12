const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()

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
      isvalid.reject({ statusCode: 'VE001', message: 'invalid input', error: formatedError })
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
        },
        firstName: {
          type: 'string',
          required: false
          // minLength: 1
        },
        lastName: {
          type: 'string',
          required: false
          // minLength: 1
        },
        businessName: {
          type: 'string',
          required: false
          // minLength: 1
        },
        city: {
          type: 'string',
          required: false
          // minLength: 1
        },
        state: {
          type: 'string',
          required: false
          // minLength: 1
        },
        country: {
          type: 'string',
          required: false
          // minLength: 1
        },
        address: {
          type: 'string',
          required: false
          // minLength: 1
        },
        contactNumber: {
          type: 'string',
          required: false
          // minLength: 1
        },
        countryCode: {
          type: 'string',
          required: false
          // minLength: 1
        },
        channelId: {
          type: 'string',
          required: false
          // minLength: 1
        },
        tokenExpireyInSeconds: {
          type: 'number',
          required: true,
          minLength: 1
        },
        postalCode: {
          type: 'string',
          required: false
          // minLength: 1
        },
        userId: {
          type: 'string',
          required: false
          // minLength: 1
        },
        otp: {
          type: 'string',
          required: false
          // minLength: 1
        },
        status: {
          type: 'string',
          required: false
          // minLength: 1
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
      isvalid.reject({ statusCode: 'VE001', message: 'invalid input', error: formatedError })
    } else {
      isvalid.resolve(request)
    }
    return isvalid.promise
  }
}

module.exports = validate
