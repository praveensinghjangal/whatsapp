const MessageHistoryService = require('../services/dbData')
const __util = require('../../../lib/util')
const __logger = require('../../../lib/logger')

const interactions = (req, res) => {
  __logger.info('add interactions API called', req.body)
  const messageHistoryService = new MessageHistoryService()
  req.body.createdAt = new Date()
  req.body.score = 0
  if (req.body.Question_1 && req.body.Question_1.toLowerCase() === '28 m x 15 m') {
    req.body.score += 1
  }
  if (req.body.Question_2 && req.body.Question_2.toLowerCase() === 'tibet') {
    req.body.score += 1
  }
  if (req.body.Question_3 && req.body.Question_3.toLowerCase() === 'may 18') {
    req.body.score += 1
  }
  if (req.body.Question_4 && req.body.Question_4.toLowerCase() === '1957') {
    req.body.score += 1
  }
  if (req.body.Question_5 && req.body.Question_5.toLowerCase() === 'football') {
    req.body.score += 1
  }
  messageHistoryService.interactionDump(req.body)
    .then(data => {
      let text = null
      console.log('eq.body.score', req.body.score)
      if (req.body.score < 3) {
        text = 'Do you wish to re-do the quiz.|_|YES|_|NO'
      } else if (req.body.score >= 3) {
        text = `Congratulations on high score of ${req.body.score}/5`
      } else {
        text = 'Thank you for the response.'
      }
      res.send({ text })
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
      console.log('sssssss', err)
      __logger.error('Error in getInteractions API called: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = {
  interactions, getInteractions
}
