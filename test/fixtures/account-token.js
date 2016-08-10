/*
  This fixture creates a new application, directory,
  and account. It issues an Oauth request for the
  account, resulting in an access token and refresh
  token in the token collections for the account
 */

var helpers = require('../it/helpers');
var OAuthPasswordGrantRequestAuthenticator = require('../../').OAuthPasswordGrantRequestAuthenticator;

function AccountAccessTokenFixture(){
}

AccountAccessTokenFixture.prototype.before = function before(done) {
  var self = this;
  helpers.getClient(function(_client){

    self.client = _client;
    helpers.createApplication(function(err,app){
      if (err) {
        return done(err);
      }

      self.application = app;
      helpers.getDefaultAccountStore(app,function(err,dir){
        if (err) {
          return done(err);
        }

        self.directory = dir;
        self.newAccount = helpers.fakeAccount();
        dir.createAccount(self.newAccount, function(err,_account) {
          self.account = _account;
          self.creationResult = [err, _account];

          /*
            We need to do a password grant request, so that we create
            an access token and refresh token for this user
           */

          var authenticator = new OAuthPasswordGrantRequestAuthenticator(app);
          authenticator.authenticate({
            username: _account.username,
            password: self.newAccount.password
          },function(err,passwordGrantResult){
            if(err){
              done(err);
            }else{
              self.passwordGrantResult = passwordGrantResult;
              done();
            }
          });
        });

      });


    });
  });
};
AccountAccessTokenFixture.prototype.after = function after(done) {
  helpers.cleanupApplicationAndStores(this.application, done);
};

module.exports = AccountAccessTokenFixture;
