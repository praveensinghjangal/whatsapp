const q = require('q')
const RedisMasterService = require('../../../lib/redis_master_service')
const redisMasterService = new RedisMasterService()
const templatemasterTableData = require('../../../config/constants').MASTER_TABLE.TEMPLATE
const __util = require('../../../lib/util')

const setData = () => {
  const dataUpdated = q.defer()
  redisMasterService.setDataInRedis(templatemasterTableData.messageTemplateCategory.name, templatemasterTableData.messageTemplateCategory.columns)
    .then(data => redisMasterService.setDataInRedis(templatemasterTableData.messageTemplateStatus.name, templatemasterTableData.messageTemplateStatus.columns))
    .then(data => redisMasterService.setDataInRedis(templatemasterTableData.messageTemplateLanguage.name, templatemasterTableData.messageTemplateLanguage.columns))
    .then(response => dataUpdated.resolve(response))
    .catch(err => {
      dataUpdated.reject(err)
    })
  return dataUpdated.promise
}

// called on load
setData()

module.exports = (req, res) => {
  setData()
    .then(response => __util.send(res, response))
    .catch(err => {
      __util.send(res, { type: err.type, err: err.err })
    })
}
