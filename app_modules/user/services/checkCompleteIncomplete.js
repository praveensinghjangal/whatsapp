const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const __constants = require('../../../config/constants')
const v = new Validator()

class checkCompleteIncomplete {
  // Account Profile Validation Schema

  checkAccountProfileStatus (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/accountProfileApi',
      type: 'object',
      required: true,
      properties: {
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
          maxLength: 60
        },
        country: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 60
        },
        addressLine1: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 250
        },
        contactNumber: {
          type: 'string',
          required: true,
          minLength: 10,
          maxLength: 10,
          pattern: __constants.VALIDATOR.number
        },
        phoneCode: {
          type: 'string',
          required: true,
          minLength: 2,
          maxLength: 2,
          pattern: __constants.VALIDATOR.number
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
    v.addSchema(schema, '/accountProfileApi')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })

    if (formatedError.length > 0) {
      isvalid.resolve({ complete: false, err: formatedError })
    } else {
      isvalid.resolve({ complete: true })
    }
    return isvalid.promise
  }

  // Business Billing Profile Validation Schema

  checkBusinessBillingProfileStatus (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/businessBillingProfileApi',
      type: 'object',
      required: true,
      properties: {
        billingName: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 80
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
          maxLength: 60
        },
        country: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 60
        },
        addressLine1: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 250
        },
        contactNumber: {
          type: 'string',
          required: true,
          minLength: 10,
          maxLength: 10,
          pattern: __constants.VALIDATOR.number
        },
        phoneCode: {
          type: 'string',
          required: true,
          minLength: 2,
          maxLength: 2,
          pattern: __constants.VALIDATOR.number
        },
        postalCode: {
          type: 'string',
          required: true,
          minLength: 6,
          maxLength: 6,
          pattern: __constants.VALIDATOR.number
        },
        gstOrTaxNo: {
          type: 'string',
          required: false,
          minLength: 5,
          maxLength: 30
        },
        panCard: {
          type: 'string',
          required: true,
          minLength: 10,
          maxLength: 20
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/businessBillingProfileApi')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.resolve({ complete: false, err: formatedError })
    } else {
      isvalid.resolve({ complete: true })
    }
    return isvalid.promise
  }
}

module.exports = checkCompleteIncomplete
