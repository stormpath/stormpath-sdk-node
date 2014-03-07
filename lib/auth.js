var _ = require('underscore');
var url = require('url');
var moment = require('moment');

var utils = require('./utils');
var AuthError = require('./error').AuthError;

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


/**
 * StormPath auth request signer for custom digest auth.
 * @param authBase
 * @constructor
 */
var sauthc1Signer = function Sauthc1Signer(apiKey, req) {

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

  var nonce = utils.guid();
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

/**
 *
 * @param {object} options
 * @param {object} options.apiKey
 * @param {object} options.apiKey.id
 * @param {object} options.apiKey.secret
 * @param {string} [options.authMethod=digest] -
 * @constructor
 */
function Auth(options) {
  options = options || {};

  if (!options.apiKey) {
    throw new AuthError('No valid authentication sources found. apiKey is required option');
  }

  if (!options.apiKey.id) {
    throw new AuthError('apiKey.id is required option');
  }

  if (!options.apiKey.secret) {
    throw new AuthError('apiKey.secret is required option');
  }

  var method = options.authMethod || 'basic';
  var id = options.apiKey.id;
  var secret = options.apiKey.secret;

  this.sign = function (req) {
    if (method === 'basic') {
      return signByBasicAuth(req);
    }
    if (method === 'digest') {
      return signBySauthc1SignerAuth(req);
    }
    throw new AuthError('Unsupported auth method ' + method);
  };

  function signByBasicAuth(req) {
    var auth = id + ':' + secret;
    req.headers['Authorization'] = 'Basic ' + utils.base64.encode(auth);
  }


  function signBySauthc1SignerAuth(req) {
    sauthc1Signer({id:id, secret: secret}, req);
  }
}


module.exports = Auth;