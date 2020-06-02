const q = require('q')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const __constants = require('../../../config/constants')
const ValidatonService = require('./validation')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const __logger = require('../../../lib/logger')

class UserData {
  constructor () {
    this.validate = new ValidatonService()
    this.uniqueId = new UniqueId()
  }

  checkUserIdExistForBusiness (userId) {
    // declare a prmoise
    const doesUserIdExist = q.defer()
    // checking using service whether the userId is  provided or not
    this.validate.checkUserIdService({ userId })
    // then using a query to check that a record exist or not in table
      .then(valResponse => {
        // console.log('Response', valResponse)

        return __db.postgresql.__query(queryProvider.getBusinessProfile(), [userId])
      })
      .then(result => {
        // console.log('Qquery Result checkUserExistByUserId', result)

        // if exist throw return true exist
        if (result && result.rowCount && result.rowCount > 0) {
          doesUserIdExist.resolve({ record: result.rows[0], exists: true })
        } else {
          // else return prmoise to continue the insertiono of data
          doesUserIdExist.resolve({ record: result.rows[0], exists: false })
        }
      })
      .catch(err => {
        __logger.error('error in checkUserExistByUserId function: ', err)
        doesUserIdExist.reject(false)
      })
    return doesUserIdExist.promise
  }
}

module.exports = UserData
