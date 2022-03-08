const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/auth/authentication')
const tokenBasedAuth = require('../../middlewares/auth/tokenBasedAuth')
const authstrategy = require('../../config').authentication.strategy
const internalSessionOrTokenAuth = require('../../middlewares/auth/internalSessionOrTokenAuth')
const bearerTokenAuth = require('../../middlewares/auth/bearerTokenAuth')
const __logger = require('../../lib/logger')
const apiHitsAllowedMiddleware = require('../../middlewares/apiHitsAllowed')

// Controller require section
const accountProfileController = require('./controllers/accoutProfile')
const accountTypeController = require('./controllers/accountType')
const billingProfileController = require('./controllers/billingProfile')
const verificationController = require('./controllers/verification')
const agreementController = require('./controllers/agreement')
const accountConfigController = require('./controllers/config')
const countController = require('./controllers/count')

// Routes
// User routes
router.post('/auth/login', require('./controllers/login'))
router.post('/signUp', require('./controllers/signUp'))
router.post('/auth/forgetpassword', require('./controllers/passwordManagement').forgetPassword)
router.post('/auth/changepassword', require('./controllers/passwordManagement').changePassword)
router.get('/auth/google', authMiddleware.authenticate(authstrategy.google.name, authstrategy.google.options))
router.get('/auth/facebook', authMiddleware.authenticate(authstrategy.facebook.name, authstrategy.google.options))
router.post('/authorize', bearerTokenAuth, require('./controllers/authorize').authorize)
router.post('/authorize/support', require('./controllers/authorize').authorizeSupportUser)
router.post('/internal/authorize', tokenBasedAuth, require('./controllers/authorize').authorize)
router.patch('/auth/resetpassword', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/passwordManagement').resetPasssword)

// Oauth user data comes to these redirectURLs
router.get('/googleRedirect', authMiddleware.authenticate(authstrategy.google.name), (req, res) => {
  __logger.info('redirected', req.user)
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
  __logger.info('redirected', req.user)
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
router.get('/account', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, accountProfileController.getAcountProfile)
router.put('/account', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, accountProfileController.updateAcountProfile)
router.get('/accountType', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, accountTypeController.getAcountType)
router.put('/account/tokenKey', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, accountProfileController.generateAndUpdateTokenKey)
router.get('/account/info', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, accountProfileController.getAccountProfileByUserId)
router.get('/account/list', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, accountProfileController.getAccountProfileList)
router.patch('/account/accountManager', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, accountProfileController.updateAccountManagerName)

// Billing Profile routes
router.get('/billing', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, billingProfileController.getBusinessBilllingProfile)
router.post('/billing', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, billingProfileController.addBusinessBilllingProfile)

// Verification routes
router.post('/verification/email', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, verificationController.generateEmailVerificationCode)
router.patch('/verification/email', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, verificationController.validateEmailVerificationCode)
router.post('/verification/sms', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, verificationController.generateSmsVerificationCode)
router.patch('/verification/sms', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, verificationController.validateSmsVerificationCode)
router.post('/otp/email', tokenBasedAuth, verificationController.generateEmailOtpCode) // internally called by /otp
router.post('/otp/sms', tokenBasedAuth, verificationController.generateSmsOtpCode) // internally called by /otp
router.post('/otp', internalSessionOrTokenAuth, apiHitsAllowedMiddleware, verificationController.sendOtpCode)
router.patch('/otp', internalSessionOrTokenAuth, apiHitsAllowedMiddleware, verificationController.validateTFa)
router.patch('/otp/new', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, verificationController.validateTempTFa)
router.patch('/otp/backup', internalSessionOrTokenAuth, apiHitsAllowedMiddleware, verificationController.validateBackupCodeAndResetTfa)
router.post('/tfa', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, verificationController.addTempTfaData)

// Account Type
router.get('/accountType', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, accountTypeController.getAcountType)

// Agreement Routes
router.get('/agreement/generate', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, agreementController.generateAgreement)
router.post('/agreement', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, agreementController.uploadAgreement)
router.get('/agreement', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, agreementController.getAgreement)
// router.get('/agreement/list', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, agreementController.getAgreementListByStatusId)
router.patch('/agreement/evaluate', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), agreementController.evaluateAgreement)
router.get('/agreement/status', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), agreementController.getAgreementStatusList)
router.patch('/agreement/status', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/agreementStatus').updateAgreementStatus)
router.get('/agreement/list', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), agreementController.getAgreementList)
router.get('/agreement/status/count', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, countController.getAgreementStatusCount)
router.get('/agreement/:userId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), agreementController.getAgreementByUserId)
// Account Config
router.get('/account/config/:userId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, accountConfigController.getAccountConfig)
router.patch('/account/config', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, accountConfigController.updateAccountConfig)
// Count
router.get('/account/created/today', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, countController.getAccountCreatedTodayCount)

module.exports = router
