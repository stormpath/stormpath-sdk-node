/*jshint expr: true*/
/*jshint unused: false*/
'use strict';

var RequestExecutor = require('../lib/reqexec'),
  loadApiKey = require('../lib/apikey').loadApiKey;
  //chai = require('chai'),
  //should = chai.should();

//chai.use(require('sinon-chai'));
//require('mocha-sinon');

var home = process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
var apiKeyFilePath = home + '/.stormpath/apiKey.properties';

/*loadApiKey(apiKeyFilePath, function apiKeyLoaded(err, apiKey) {
  if (err) {
    console.log(err);
    return;
  }

  var options = {};
  options.apiKey = apiKey;

  var reqexec = new RequestExecutor(options);

  reqexec.execute({uri: 'https://api.stormpath.com/v1/tenants/current'}, function onResponseBody(err, body) {
    if (err) {
      console.log('Error trying to communicate: ' + err.message);
    } else {
      console.log('Respondes body: ' + body);
    }
  });
}); */
