const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
// "payload": {
//     "text": "This is an example response"
// }
class validate {
  userInputValidation (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/userInputValidation',
      type: 'object',
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
        first_name: {
          type: 'string',
          required: false
          // minLength: 1
        },
        last_name: {
          type: 'string',
          required: false
          // minLength: 1
        },
        business_name: {
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
        contact_number: {
          type: 'string',
          required: false
          // minLength: 1
        },
        country_code: {
          type: 'string',
          required: false
          // minLength: 1
        },
        channel_id: {
          type: 'string',
          required: false
          // minLength: 1
        },
        token_expiry_in_seconds: {
          type: 'string',
          required: false
          // minLength: 1
        },
        postal_code: {
          type: 'string',
          required: false
          // minLength: 1
        },
        user_id: {
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
    v.addSchema(schema, '/userInputValidation')
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
