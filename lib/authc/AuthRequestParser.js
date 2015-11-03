'use strict';

var url = require('url');

var ApiAuthRequestError = require('../error/ApiAuthRequestError');

function AuthRequestParser(request,locationsToSearch){

  if(typeof request !=='object'){
    throw new ApiAuthRequestError({userMessage: 'request must be an object'});
  }
  if(typeof request.url !== 'string'){
    throw new ApiAuthRequestError({userMessage: 'request must have a url string'});
  }
  if(typeof request.headers !== 'object'){
    throw new ApiAuthRequestError({userMessage: 'request must have a headers object'});
  }
  if(typeof request.method !== 'string'){
    throw new ApiAuthRequestError({userMessage: 'request must have a method property'});
  }
  if(typeof locationsToSearch !== 'object') {
    throw new ApiAuthRequestError({userMessage: 'locationsToSearch must be an array'});
  }

  var req = request;
  var searchBody = locationsToSearch.indexOf('body') > -1;
  var searchHeader = locationsToSearch.indexOf('header') > -1;
  var searchUrl = locationsToSearch.indexOf('url') > -1;

  var urlParams = url.parse(req.url,true).query;

  this.body = (searchBody && (typeof req.body === 'object') && (req.body !== null)) ? req.body : {};
  this.headers = searchHeader ? req.headers : {};

  this.grantType = this.body.grant_type || urlParams.grant_type || '';
  this.authorizationValue = searchHeader ?
    (this.headers['authorization'] || this.headers['Authorization'] || '') : '';
  this.accessToken = searchUrl ?
    (urlParams.access_token || this.body.access_token || this.authorizationValue) :
      (this.body.access_token || this.authorizationValue);

  this.requestedScope = (this.body.scope || urlParams.scope || '').split(' ');
}

module.exports = AuthRequestParser;
