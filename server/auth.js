/* eslint-disable consistent-return, node/no-unpublished-require, node/no-missing-require, no-unused-vars */

const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const DevStrategy = require('passport-dev').Strategy;
const OAuthStrategy = require('passport-oauth2').Strategy;
const config = require('config');

const ENV = config.get('env');
const SAML_CERT = config.get('saml.cert');
let SAML_PVK = config.get('saml.pvk');
// Need to replace the newlines pulled from environment variable with actual
// newlines, otherwise passport-saml breaks.
SAML_PVK = SAML_PVK.replace(/\\n/g, '\n');
const SAML_CALLBACK_URL = config.get('saml.callbackUrl');
const Auth = {};

// OSU SSO url (saml)
const samlUrl = 'https://login.oregonstate.edu/idp/profile/';
const samlLogout = samlUrl + 'Logout';

if (ENV === 'production') {
  Auth.passportStrategy = new SamlStrategy(
    {
      acceptedClockSkewMs: 500,
      disableRequestedAuthnContext: true,
      identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
      callbackUrl: SAML_CALLBACK_URL,
      logoutUrl: samlLogout,
      entryPoint: samlUrl + 'SAML2/Redirect/SSO',
      issuer: 'https://my.oregonstate.edu',
      cert: SAML_CERT,
      privateCert: SAML_PVK,
      decryptionPvk: SAML_PVK,
      signatureAlgorithm: 'sha256'
    },
    (profile, done) => {
      let user = {
        osuId: profile['urn:oid:1.3.6.1.4.1.5016.2.1.2.1'],
        email: profile['urn:oid:1.3.6.1.4.1.5923.1.1.1.6'],
        firstName: profile['urn:oid:2.5.4.42'],
        lastName: profile['urn:oid:2.5.4.4'],
        isAdmin: false
      };

      let permissions = profile['urn:oid:1.3.6.1.4.1.5923.1.1.1.7'] || [];
      if (permissions.includes('urn:mace:oregonstate.edu:entitlement:dx:dx-admin')) {
        user.isAdmin = true;
      }
      return done(null, user);
    }
  );
} else {
  // Configure Dev Strategy
  Auth.passportStrategy = new DevStrategy('saml', {
    email: 'fake-email@oregonstate.edu',
    firstName: 'Test',
    lastName: 'User',
    permissions: ['urn:mace:oregonstate.edu:entitlement:dx:dx-admin'],
    osuId: 111111111,
    isAdmin: true
  });
}

Auth.serializeUser = (user, done) => {
  done(null, user);
};

Auth.deserializeUser = (user, done) => {
  done(null, user);
};

Auth.login = function(req, res, next) {
  return passport.authenticate('saml', function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send(400, {
        message: 'Bad username or password'
      });
    }

    req.login(user, function(err) {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  })(req, res, next);
};

Auth.logout = (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect(samlLogout);
};

Auth.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send('Unauthorized');
};

Auth.ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }

  return res.status(401).send('Unauthorized');
};

Auth.oAuth2Strategy = new OAuthStrategy(
  {
    authorizationURL: 'https://oregonstate.test.instructure.com/login/oauth2/auth',
    tokenURL: 'https://oregonstate.test.instructure.com/login/oauth2/token',
    clientID: config.get('canvasOauth.id'),
    clientSecret: config.get('canvasOauth.secret'),
    callbackURL: config.get('canvasOauth.callbackUrl')
  },
  function(accessToken, refreshToken, params, profile, done) {
    let user = {
      userId: params.user.id,
      fullName: params.user.name,
      accessToken: accessToken,
      refreshToken: refreshToken,
      expireTime: ((Date.now() / 1000) | 0) + params.expires_in
    };
    done(null, user);
  }
);
module.exports = Auth;
