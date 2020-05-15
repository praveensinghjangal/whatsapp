const express = require('express')
const authMiddleware = require('../../middlewares/authentication')
const authstrategy = require('../../config').authentication.strategy
const router = express.Router()

/* Controller start */
const accountProfileController = require('./controllers/accoutProfile')
const billingProfileController = require('./controllers/billingProfile')

/* Controller end */

/* Route start */

router.post('/auth/login', require('./controllers/login'))
router.post('/signUp', require('./controllers/signUp'))
router.get('/auth/google', authMiddleware.authenticate(authstrategy.google.name, authstrategy.google.options))
router.get('/auth/facebook', authMiddleware.authenticate(authstrategy.facebook.name, authstrategy.google.options))

// Oauth user data comes to these redirectURLs
router.get('/googleRedirect', authMiddleware.authenticate(authstrategy.google.name), (req, res) => {
  console.log('redirected', req.user)
  const user = {
    displayName: req.user.displayName,
    name: req.user.name.givenName,
    email: req.user._json.email,
    provider: req.user.provider
  }
  const token = authMiddleware.setToken(user, 600)
  res.send(token)
})
router.get('/facebookRedirect', authMiddleware.authenticate(authstrategy.facebook.name), (req, res) => {
  console.log('redirected', req.user)
  const user = {
    displayName: req.user.displayName,
    name: req.user._json.name,
    email: req.user._json.email,
    provider: req.user.provider
  }
  const token = authMiddleware.setToken(user, 600)
  res.send(token)
})

// Account Profile routes

router.get('/account', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), accountProfileController.getAcountProfile)
router.put('/account', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), accountProfileController.updateAcountProfile)

// Billing Profile routes
router.get('/billing', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), billingProfileController.getBusinessBilllingProfile)
router.post('/billing', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), billingProfileController.addBusinessBilllingProfile)
router.put('/billing', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), billingProfileController.updateBusinessBilllingProfile)

module.exports = router
