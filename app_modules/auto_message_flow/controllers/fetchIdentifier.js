const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const DbService = require('../services/dbData')
const ValidatonService = require('../services/validation')
const _ = require('lodash')
const q = require('q')

const fetchIdentifier = (req, res) => {
  __logger.info('Inside fetchIdentifier')
  const {
    flowTopic, parentIdentfierText
  } = req.query

  const inputArray = []

  if (flowTopic) {
    inputArray.push({ colName: 'amf.flow_topic', value: flowTopic })
  }
  if (parentIdentfierText) {
    inputArray.push({ colName: 'amf.parent_identifier_text', value: parentIdentfierText })
  }

  const columnArray = []
  const valArray = []

  _.each(inputArray, function (input) {
    if (input.value !== undefined && input.value !== null) { // done so because false expected in some values
      columnArray.push(input.colName)
      valArray.push(input.value)
    }
  })

  const wabaNumber = req.body.wabaNumber ? req.body.wabaNumber : null

  const dbService = new DbService()
  const validate = new ValidatonService()
  let processed = q
  if (req.query.flowTopic || req.query.parentIdentfierText) {
    processed = validate.checkWabaNumberExist(req.body)
  } else {
    processed = processed.resolve()
  }

  processed
    .then(() => dbService.getIdentifierData(wabaNumber, columnArray, valArray))
    .then(data => {
      if (data && data.length > 0) {
        __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
      } else {
        __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = fetchIdentifier
