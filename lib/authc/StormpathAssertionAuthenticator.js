'use strict';

var njwt = require('njwt');
var AssertionAuthenticationResult = require('./AssertionAuthenticationResult');

function StormpathAssertionAuthenticator(application) {
  Object.defineProperty(this, 'dataStore', {
    enumerable:false,
    value: application.dataStore
  });

  this.secret = this.dataStore.requestExecutor.options.client.apiKey.secret;
}

StormpathAssertionAuthenticator.prototype.authenticate = function authenticate(stormpathToken, callback) {
  var dataStore = this.dataStore;
  njwt.verify(stormpathToken, this.secret, function (err, jwt) {
    if (err) {
      err.statusCode = 401;
      return callback(err);
    }

    if (jwt.body.err){
      return callback(jwt.body.err);
    }

    // For Stormpath mapped JWT fields, see:
    // https://docs.stormpath.com/rest/product-guide/latest/005_auth_n.html#step-5-stormpath-response-with-jwt
    var accountHref = jwt.body.sub;

    if (!accountHref) {
      return callback(new Error('Stormpath Account HREF (sub) in JWT not provided.'));
    }

    callback(null, new AssertionAuthenticationResult(
      dataStore, {
        stormpath_token: stormpathToken,
        expandedJwt: jwt,
        account: {
          href: accountHref
        }
      }
    ));
  });

  return this;
};

module.exports = StormpathAssertionAuthenticator;
