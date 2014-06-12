var url = require('url');
var ApiAuthRequestError = require('../error/ApiAuthRequestError');


function uppecaseFirstChar(str){
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function AuthRequestParser(request){
  if(typeof request !=='object'){
    throw new ApiAuthRequestError('request must be an object');
  }
  if(typeof request.headers !== 'object'){
    throw new ApiAuthRequestError('request must have a headers object');
  }
  var req = request;
  this.req = req;
  this.body = typeof this.req.body === 'object' ? this.req.body : {};
  this.query = typeof this.req.query === 'object' ?
    this.req.query : url.parse(this.req.url,true).query;
}
AuthRequestParser.prototype.getParam = function getParam(param) {
  return this.body[param] || this.query[param];
};
AuthRequestParser.prototype.getHeaderValue = function getHeaderValue(headerField) {
  return this.req.headers[headerField] ||
    this.req.headers[uppecaseFirstChar(headerField)] || '';
};

module.exports = AuthRequestParser;