// const __logger = require('../../../lib/logger')
// const __constants = require('../../../config/constants')
// const __util = require('../../../lib/util')
// const __db = require('../../../lib/db')
// const queryProvider = require('../queryProvider')

// /**
//  * @namespace -Plans-Controller-
//  * @description This Controller includes Helo-whatsapp active Plan related APIs
//  */

// /**
//  * @memberof -Plans-Controller-
//  * @name Get-all-Plans
//  * @path {GET} /plans
//  * @description Bussiness Logic :- This API provide the list of plans available with helo-whatsapp.
//  * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
//   <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/plans/GetAllPlans|getAllPlans}
//  * @response {string} ContentType=application/json - Response content type.
//  * @response {string} metadata.msg=Success  - Response got successfully.
//  * @response {array} metadata.data - It gives us the array of json of helo-whatsapp plans including the attribute as planValidity, planCost, planCategory, planBenefits.
//  * @code {200} if the msg is success than return List of all plans.
//  * @author Arjun Bhole 17th June, 2020
//  * *** Last-Updated :- Arjun Bhole 10th July,2020 ***
//  */

// const getAllPlans =
// (req, res) => {
//   __logger.info('Get Plan List API Called')
//   __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getPlanList(), [])
//     .then(result => {
//       if (result && result.affectedRows && result.affectedRows === 0) {
//         __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
//       } else {
//         __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
//       }
//     })
//     .catch(err => {
//       __logger.error('error in create user function: ', err)
//       __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
//     })
// }

// module.exports = {
//   getAllPlans

// }
