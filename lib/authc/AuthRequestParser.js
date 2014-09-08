var url = require('url');
var ApiAuthRequestError = require('../error/ApiAuthRequestError');

function AuthRequestParser(request,locationsToSearch){

  if(typeof request !=='object'){
    throw new ApiAuthRequestError('request must be an object');
  }
  if(typeof request.headers !== 'object'){
    throw new ApiAuthRequestError('request must have a headers object');
  }
  if(typeof request.method !== 'string'){
    throw new ApiAuthRequestError('request must have a method property');
  }
  var req = request;
  var searchBody = locationsToSearch.indexOf('body') > -1;
  var searchHeader = locationsToSearch.indexOf('header') > -1;
  var searchUrl = locationsToSearch.indexOf('url') > -1;

  var body = typeof req.body === 'object' ? req.body : {};

  var urlParams = url.parse(req.url,true).query;

  this.body = (searchBody && typeof req.body === 'object') ? req.body : {};
  this.headers = searchHeader ? req.headers : {};

  this.grantType = body.grant_type || urlParams.grant_type || '';
  this.authorizationValue = searchHeader ?
    (this.headers['authorization'] || this.headers['Authorization'] || '') : '';
  this.accessToken = searchUrl ?
    (urlParams.access_token || body.access_token || this.authorizationValue) :
      (body.access_token || this.authorizationValue);

  this.requestedScope = (body.scope || urlParams.scope || '').split(' ');
}

module.exports = AuthRequestParser;