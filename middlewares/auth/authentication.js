const jwt = require('jsonwebtoken')
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const authConfig = require('../../config').authentication
const setWabaDataMiddleware = require('../setWabaData')

const cookieTokenExtractor = req => {
  var token = null
  if (req && req.cookies) {
    token = req.cookies.jwt
  }
  return token
}

const authHeaderTokenExtractor = req => {
  let token = null
  if (req && req.headers) {
    try {
      if ('authorization' in req.headers) {
        token = req.headers.authorization
      } else {
        token = null
      }
      // token = original_token.split(' ')[1]
    } catch (e) {
      token = null
    }
  }
  return token
}

const setJwtStrategy = opts => {
  passport.use(new JwtStrategy(opts, (jwtPayload, done) => {
    // custom security validation
    return done(null, jwtPayload.data)
  }))
}

const setGoogleStrategy = () => {
  passport.use(new GoogleStrategy(authConfig.google,
    (accessToken, refreshToken, profile, done) => done(null, profile)))
}

const setFacebookStrategy = () => {
  passport.use(new FacebookStrategy(authConfig.facebook,
    (accessToken, refreshToken, profile, done) => done(null, profile)))
}

class Authentication {
  constructor () {
    this.app = {}
    this.opts = {
      jwtFromRequest: ExtractJwt.fromExtractors([authHeaderTokenExtractor, cookieTokenExtractor]),
      secretOrKey: authConfig.jwtSecretKey
    }
  }

  initialize (app) {
    this.app = app
    this.app.use(passport.initialize())
    passport.serializeUser((user, done) => {
      done(null, user)
    })
    passport.deserializeUser((obj, done) => {
      done(null, obj)
    })
    this.setStrategy()
  }

  setStrategy () {
    if (authConfig.internal && authConfig.internal.allow) setJwtStrategy(this.opts)
    if (authConfig.internal && authConfig.facebook.allow) setFacebookStrategy()
    if (authConfig.internal && authConfig.google.allow) setGoogleStrategy()
  }

  authenticate (strategy, options) {
    return [passport.authenticate(strategy, options), setWabaDataMiddleware]
  }

  authenticateNoJwt (strategy, options) {
    return passport.authenticate(strategy, options)
  }

  setToken (data, expirySeconds) {
    return jwt.sign({ data }, this.opts.secretOrKey, { expiresIn: expirySeconds })
  }
}

module.exports = new Authentication()
