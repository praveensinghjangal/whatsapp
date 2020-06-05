const q = require('q')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const ValidatonService = require('./validation')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')

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
        return __db.postgresql.__query(queryProvider.getMessageTemplateDataByWabaId(), [wabaInformationId])
      })
      .then(result => {
        // if exist throw return true exist
        if (result && result.rowCount && result.rowCount > 0) {
          doesWabaIdExist.resolve({ record: result.rows[0], exists: true })
        } else {
          // else return prmoise to continue the insertiono of data
          doesWabaIdExist.resolve({ record: result.rows[0], exists: false })
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
