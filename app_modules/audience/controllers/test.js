const Template = require('../../integration/facebook/template')
// const IntegrationService = require('../../integration')

// const testApi = (req, res) => {
//   console.log('here', req.body.number)
//   const authService = new Template('dba50b76-4f7c-4987-a9c0-a84ced291dbd')
//   authService.deleteTemplate(req.body.number, 'welcome_1_five_7')
//     .then((data) => {
//       console.log('testttttt', data)
//       res.json(data)
//     }).catch(err => {
//       console.log(err)
//     })
// }

const testApi = (req, res) => {
  console.log('here', req.body.number)
  const authService = new Template('dba50b76-4f7c-4987-a9c0-a84ced291dbd')
  authService.getTemplateInfo(req.body.number, 'welcome_1_five_7')
    .then((data) => {
      console.log('testttttt', data)
      res.json(data)
    }).catch(err => {
      console.log(err)
    })
}

// const testApi = (req, res) => {
//   console.log('here', req.body.number)
//   const authService = new Template('dba50b76-4f7c-4987-a9c0-a84ced291dbd')
//   authService.getTemplateList(req.body.number)
//     .then((data) => {
//       console.log('testttttt', data)
//       res.json(data)
//     }).catch(err => {
//       console.log(err)
//     })
// }

// const testApi = (req, res) => {
//   console.log('here', req.body.number)
//   const authService = new IntegrationService.Authentication('a4f03720-3a33-4b94-b88a-e10453492183', 'dba50b76-4f7c-4987-a9c0-a84ced291dbd')
//   authService.getFaceBookTokensByWabaNumber(req.body.number)
//     .then((data) => {
//       console.log('testttttt', data)
//     }).catch(err => {
//       console.log(err)
//     })
// }

module.exports = {
  testApi
}
