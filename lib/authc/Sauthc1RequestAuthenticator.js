'use strict';

var moment = require('moment');
var url = require('url');
var uuid = require('uuid');

var _ = require('../underscore');
var RequestAuthenticator = require('./RequestAuthenticator');
var utils = require('../utils');

var HOST_HEADER = 'Host',
  AUTHORIZATION_HEADER = 'Authorization',
  STORMPATH_DATE_HEADER = 'X-Stormpath-Date',
  ID_TERMINATOR = 'sauthc1_request',
  ALGORITHM = 'HMAC-SHA-256',
  AUTHENTICATION_SCHEME = 'SAuthc1',
  SAUTHC1_ID = 'sauthc1Id',
  SAUTHC1_SIGNED_HEADERS = 'sauthc1SignedHeaders',
  SAUTHC1_SIGNATURE = 'sauthc1Signature',
  NL = '\n';

function Sauthc1RequestAuthenticator() {
  Sauthc1RequestAuthenticator.super_.apply(this, arguments);
}
utils.inherits(Sauthc1RequestAuthenticator, RequestAuthenticator);

//TODO: finish this implementation:
Sauthc1RequestAuthenticator.prototype.authenticate = function sauthc1Authenticate(req) {
  var apiKey = this.apiKey;

  function isDefaultPort(parsedUrl) {
    var protocol = parsedUrl.protocol;
    var port = parsedUrl.port;
    return !port || (port === 80 && protocol.test(/http/ig)) ||
      (port === 443 && protocol.test(/https/ig));
  }

  function encodeUrl(path) {
    return path
      .replace('+', '%20')
      .replace('*', '%2A')
      .replace('%7E', '~')
      .replace('%2F', '/');
  }

  var timeStamp = moment.utc().format('YYYYMMDDTHHmmss[Z]');
  var dateStamp = moment.utc().format('YYYYMMDD');

  var nonce = uuid.v4(); //correct UUIDs provide better entropy than using JS's (not-so-random) Random
  var parsedUrl = url.parse(req.url);
  var hostHeader = isDefaultPort(parsedUrl) ? parsedUrl.hostname : parsedUrl.host;

  req.headers[HOST_HEADER] = hostHeader;
  req.headers[STORMPATH_DATE_HEADER] = timeStamp;

  var method = req.method;
  var canonicalResourcePath = parsedUrl.path ? encodeUrl(parsedUrl.path) : '/';
  var canonicalQueryString = parsedUrl.query ? encodeUrl(parsedUrl.query) : '';
  var authHeaders = _.clone(req.headers);

  // FIXME: REST API doesn't want this header in the signature
  delete authHeaders['Content-Length'];

  var sortedHeaderKeys = [];
  _.each(Object.keys(authHeaders), function (key) {
    sortedHeaderKeys.push(key);
  });
  sortedHeaderKeys = sortedHeaderKeys.sort();

  var canonicalHeadersString = '';
  _.each(sortedHeaderKeys, function (val) {
    canonicalHeadersString += val.toLowerCase() + ':' + authHeaders[val] + NL;
  });

  var signedHeadersString = sortedHeaderKeys.join(';').toLowerCase();

  var requestPayloadHashHex = utils.crypto.toHex(
    utils.crypto.sha256(req.body || ''));

  var canonicalRequest = [method, canonicalResourcePath, canonicalQueryString,
    canonicalHeadersString, signedHeadersString, requestPayloadHashHex]
    .join(NL);

  var id = [apiKey.id, dateStamp, nonce, ID_TERMINATOR].join('/');

  var canonicalRequestHashHex = utils.crypto.toHex(
    utils.crypto.sha256(canonicalRequest));

  var stringToSign = [ALGORITHM, timeStamp, id, canonicalRequestHashHex]
    .join(NL);


  function _sign(data, key) {
    return utils.crypto.hmac(key, data);
  }

  // SAuthc1 uses a series of derived keys, formed by hashing different
  // pieces of data

  var kSecret = AUTHENTICATION_SCHEME + apiKey.secret;
  var kDate = _sign(dateStamp, kSecret);
  var kNonce = _sign(nonce, kDate);
  var kSigning = _sign(ID_TERMINATOR, kNonce);

  var signature = _sign(stringToSign, kSigning);
  var signatureHex = utils.crypto.toHex(signature);

  var authorizationHeader = [
    AUTHENTICATION_SCHEME + ' ' + SAUTHC1_ID + '=' + id,
    SAUTHC1_SIGNED_HEADERS + '=' + signedHeadersString,
    SAUTHC1_SIGNATURE + '=' + signatureHex
  ].join(', ');

  req.headers[AUTHORIZATION_HEADER] = authorizationHeader;
};

module.exports = Sauthc1RequestAuthenticator;
