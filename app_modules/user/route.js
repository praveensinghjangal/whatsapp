const express = require('express')
const authMiddleware = require('../../middlewares/authentication')
const authstrategy = require('../../config').authentication.strategy
const router = express.Router()

// Controller require section
const accountProfileController = require('./controllers/accoutProfile')
const accountTypeController = require('./controllers/accountType')
const billingProfileController = require('./controllers/billingProfile')
const verificationController = require('./controllers/verification')
const agreementController = require('./controllers/agreement')

// Routes
// User routes
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
router.get('/accountType', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), accountTypeController.getAcountType)

// Billing Profile routes
router.get('/billing', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), billingProfileController.getBusinessBilllingProfile)
router.post('/billing', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), billingProfileController.addBusinessBilllingProfile)

// Verification routes
router.post('/verification/email', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), verificationController.generateEmailVerificationCode)
router.patch('/verification/email', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), verificationController.validateEmailVerificationCode)
router.post('/verification/sms', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), verificationController.generateSmsVerificationCode)
router.patch('/verification/sms', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), verificationController.validateSmsVerificationCode)

// Account Type
router.get('/accountType', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), accountTypeController.getAcountType)
// Agreement Routes
router.get('/agreement/generate', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), agreementController.generateAgreement)
router.post('/agreement', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), agreementController.uploadAgreement)
router.get('/agreement', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), agreementController.getAgreement)

module.exports = router
