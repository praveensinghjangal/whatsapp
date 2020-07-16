const q = require('q')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const ValidatonService = require('./validation')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const __logger = require('../../../lib/logger')

class templateService {
  constructor () {
    this.validate = new ValidatonService()
    this.uniqueId = new UniqueId()
  }

  checkWabaIdExist (wabaInformationId) {
    __logger.info('valResponse', wabaInformationId)

    // declare a prmoise
    const doesWabaIdExist = q.defer()
    // checking using service whether the wabaInformationId is  provided or not
    this.validate.checkWabaIdExistService({ wabaInformationId })
    // then using a query to check that a record exist or not in table
      .then(valResponse => {
        __logger.info('valResponse', valResponse)
        return __db.mysql.query(queryProvider.getMessageTemplateDataByWabaId(), [wabaInformationId])
      })
      .then(result => {
        // if exist throw return true exist
        if (result && result.affectedRows && result.affectedRows > 0) {
          doesWabaIdExist.resolve({ record: result[0], exists: true })
        } else {
          // else return prmoise to continue the insertiono of data
          doesWabaIdExist.resolve({ record: result[0], exists: false })
        }
      })
      .catch(err => {
        __logger.error('error in checkUserExistByUserId function: ', err)
        doesWabaIdExist.reject(false)
      })
    return doesWabaIdExist.promise
  }
}

module.exports = templateService
