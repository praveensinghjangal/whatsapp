const MessageHistoryService = require('../services/dbData')
const __util = require('../../../lib/util')
const __logger = require('../../../lib/logger')

const interactions = (req, res) => {
  __logger.info('add interactions API called', req.body)
  const messageHistoryService = new MessageHistoryService()
  req.body.createdAt = new Date()
  req.body.score = 10
  req.body.audience = '98xxxxxxxxx29'
  messageHistoryService.interactionDump(req.body)
    .then(data => {
      res.send({ text: 'success' })
    })
    .catch(err => {
      __logger.error('Error in interactions API called: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const getInteractions = (req, res) => {
  __logger.info('add getInteractions API called', req.body)
  const messageHistoryService = new MessageHistoryService()
  const json2csv = require('json2csv').parse
  messageHistoryService.getInteractions()
    .then(data => {
      const csvString = json2csv(data)
      res.setHeader('Content-disposition', 'attachment; filename=interactions-report.csv')
      res.set('Content-Type', 'text/csv')
      res.status(200).send(csvString)
    })
    .catch(err => {
      __logger.error('interaction: getInteractions():', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = {
  interactions, getInteractions
}
