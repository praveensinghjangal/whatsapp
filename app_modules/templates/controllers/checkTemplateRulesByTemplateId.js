const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const RuleEngine = require('../services/ruleEngine')

module.exports = (req, res) => {
  __logger.info('Inside templates/:templateId/validate', req.user.userId)
  const ruleEngine = new RuleEngine()
  ruleEngine.checkAddTemplateRulesByTemplateId(req.params.templateId, req.user.user_id)
    .then(results => {
      __logger.info('results', { results })
      const details = results.err && results.err.err ? results.err.err : ''
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { valid: results.complete || false, details } })
    })
    .catch(err => {
      __logger.error('error: ', err)
      __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
}
