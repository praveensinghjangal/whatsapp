const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
// "payload": {
//     "text": "This is an example response"
// }
class validate {
  sendMessage (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/sendMessage',
      type: 'object',
      required: true,
      properties: {
        senderNumber: {
          type: 'string',
          required: true,
          minLength: 1
        },
        receiverNumber: {
          type: 'string',
          required: true,
          minLength: 1
        },
        payload: {
          type: 'object',
          required: true,
          minLength: 1,
          properties: {
            text: {
              type: 'string',
              required: true,
              minLength: 1
            }
          }
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/sendMessage')
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

  sendMessageToQueue (request) {
    const isvalid = q.defer()
    isvalid.resolve(request)
    return isvalid.promise
    const schema = {
      id: '/sendMessage',
      type: 'object',
      required: true,
      properties: {
        senderNumber: {
          type: 'string',
          required: true,
          minLength: 1
        },
        receiverNumber: {
          type: 'string',
          required: true,
          minLength: 1
        },
        payload: {
          type: 'object',
          required: true,
          minLength: 1,
          properties: {
            text: {
              type: 'string',
              required: true,
              minLength: 1
            }
          }
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/sendMessage')
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
