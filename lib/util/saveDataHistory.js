const q = require('q')
const _ = require('lodash')
const __db = require('../db')
const __constants = require('../../config/constants')
const __logger = require('../logger')
const UniqueId = require('./uniqueIdGenerator')
const Validator = require('jsonschema').Validator
const v = new Validator()

const validateInput = input => {
  const isvalid = q.defer()
  const schema = {
    id: '/saveHistoryData',
    type: 'object',
    required: true,
    properties: {
      entityName: {
        type: 'string',
        required: true,
        minLength: 1
      },
      entityRowId: {
        type: 'string',
        required: true,
        minLength: 1
      },
      userId: {
        type: 'string',
        required: true,
        minLength: 1
      },
      entityData: {
        type: 'object',
        required: true,
        minProperties: 1
      }
    }
  }
  const formatedError = []
  v.addSchema(schema, '/saveHistoryData')
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

module.exports = (entityData, entityName, entityRowId, userId) => {
  const historyStored = q.defer()
  const uniqueId = new UniqueId()
  const query = `insert into history_data(history_data_id,entity_data,entity_name,entity_row_id,user_id)
                values(?,?,?,?,?)`
  __logger.info('Inside function to store old row in history table', entityName, entityRowId, userId)
  validateInput({ entityData, entityName, entityRowId, userId })
    .then(validData => __db.mysql.query(__constants.HW_MYSQL_NAME, query, [uniqueId.uuid(), entityData, entityName, entityRowId, userId]))
    .then(result => {
      if (result && result.affectedRows && result.affectedRows > 0) {
        historyStored.resolve(true)
      } else {
        historyStored.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      historyStored.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return historyStored.promise
}
