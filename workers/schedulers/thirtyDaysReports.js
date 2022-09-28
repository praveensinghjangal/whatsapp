const q = require('q')
// const _ = require('lodash')
// const __db = require('../../lib/db')
const __constants = require('../../config/constants')
// const __logger = require('../../lib/logger')
const moment = require('moment')
const getCampaignCount = require('./getCampaignCount')

const thirtyDaysReports = () => {
  const daysReports = q.defer()
  for (var i = 0; i < __constants.DAYWORKER; i++) {
    var firstDate = moment().subtract(i + 1, 'days').format('DD-MM-YYYY')
    var secondDate = moment().subtract(i, 'days').format('DD-MM-YYYY')
    getCampaignCount(firstDate, secondDate)
  }
  return daysReports.promise
}
module.exports = thirtyDaysReports
