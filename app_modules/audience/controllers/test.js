// const AuthService = require('../../../lib/auth_service/authService')
const AuthService = require('../../integration/facebook/auth_service/authService')

const testApi = (req, res) => {
  console.log('here', req.body.number)
  const authService = new AuthService()
  authService.getWabaTokenByPhoneNumber(req.body.number)
    .then((data) => {
      console.log('testttttt', data)
    }).catch(err => {
      console.log(err)
    })
}

module.exports = {
  testApi
}
