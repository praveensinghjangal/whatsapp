const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
// const __define = require('../../../config/define')

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
      console.log('Formatted Error Acunt profile', formatedError)
      isvalid.resolve({ complete: false, err: formatedError })
    } else {
      isvalid.resolve({ complete: true })
    }
    return isvalid.promise
  }

  // Business Profile Validation Schema

  checkBusinessProfileStatus (request) {
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
        },
        gstOrTaxNo: {
          type: 'string',
          required: false,
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
      isvalid.resolve({ complete: false, err: formatedError })
    } else {
      isvalid.resolve({ complete: true })
    }
    return isvalid.promise
  }
}

module.exports = checkCompleteIncomplete
