const q = require('q')
const _ = require('lodash')
const __db = require('../../../lib/db')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const Validator = require('jsonschema').Validator
const v = new Validator()

const validateInput = input => {
  const isvalid = q.defer()
  const schema = {
    id: '/getCategoryMapping',
    type: 'object',
    required: true,
    properties: {
      categoryId: {
        type: 'string',
        required: true,
        minLength: 1
      },
      serviceProviderId: {
        type: 'string',
        required: true,
        minLength: 1
      }
    }
  }
  const formatedError = []
  v.addSchema(schema, '/getCategoryMapping')
  const error = _.map(v.validate(input, schema).errors, 'stack')
  _.each(error, function (err) {
    const formatedErr = err.split('.')
    formatedError.push(formatedErr[formatedErr.length - 1])
  })
  if (formatedError.length > 0) {
    isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
  } else {
    isvalid.resolve(input)
  }
  return isvalid.promise
}

module.exports = (categoryId, serviceProviderId) => {
  const serviceProviderCategory = q.defer()
  const query = `select service_provider_category
  from message_template_category_to_service_provider_template_category
  where is_active = 1 and message_template_category_id = ? and service_provider_id = ?`
  __logger.info('Inside function to getCategoryMapping', { categoryId, serviceProviderId })
  validateInput({ categoryId, serviceProviderId })
    .then(validData => __db.mysql.query(__constants.HW_MYSQL_NAME, query, [categoryId, serviceProviderId]))
    .then(result => {
      if (result && result.length > 0) {
        serviceProviderCategory.resolve(result[0])
      } else {
        serviceProviderCategory.reject({ type: __constants.RESPONSE_MESSAGES.CATEGORY_MAPPING_NOT_FOUND, err: {} })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      serviceProviderCategory.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return serviceProviderCategory.promise
}
