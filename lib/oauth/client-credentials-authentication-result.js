
// TODO! Implement this class, and the OAuthClientCredentialsAuthenticator,
// and deprecate Application.authenticateApiRequest().  At the moment, these
// documented methods all exist on the `AuthenticationResult`, which is
// confusing because you get different member methods and capabilities,
// depending on the way that the `AuthenticationResult` is constructed.

/**
 * @class OAuthClientCredentialsAuthenticationResult
 *
 * @augments {AuthenticationResult}
 *
 * @description
 * Encapsulates an authentication result, that was produced when the end-user
 * supplied the {@link ApiKey} of an {@link Account} and specified
 * `grant_type=client_credentials`.
 *
 * This class should not be constructed manually.  Instead, an instance of this
 * result should be obtained from
 * {@link Application#authenticateApiRequest Application.authenticateApiRequest()}.
 *
 *
 */

/**
 * @name getAccessToken
 *
 * @memberOf OAuthClientCredentialsAuthenticationResult
 *
 * @description
 *
 * Use this method to get a compacted JSON Web Token. This token can be given to
 * the client who has authenticated, and can be used for subsequent authentication
 * attempts.
 *
 * The token is tied to the application which generated the authentication
 * result, the `iss` field will the the HREF of the application and the `sub`
 * field will be the ID of the {@link ApiKey} of the {@link Account} that
 * authenticated.
 */

/**
 * @name  getAccessTokenResponse
 *
 * @memberOf OAuthClientCredentialsAuthenticationResult
 *
 * @description
 *
 * Use this method to generate an OAuth-compatible response body.
 *
 * You may pass an existing JWT instance, or allow it to create a JWT with the
 * same claims as `getAccessToken()`. It will return a JSON object that can be
 * delivered as an HTTP response. The format of the object is tokenResponse,
 * see below.
 *
 * @example
 *
 * // Get the compacted JWT as a Base64-URL encoded token
 *
 * var responseBody = authenticationResult.getAccessTokenResponse();
 */

/**
 * @name  getJwt
 *
 * @memberOf OAuthClientCredentialsAuthenticationResult
 *
 * @description
 *
 * This method returns a JWT instance (from the nJwt library) which is
 * pre-configured with the same claims that you would get from calling
 * `getAccessToken()`. This method exists in case you need to make more
 * modifications to the JWT before you compact it to an access token.
 *
 * @example
 *
 * var jwt = authenticationResult.getJwt();
 *
 * jwt.setExpiration(new Date('2015-07-01')); // A specific date
 * jwt.setExpiration(new Date().getTime() + (60*60*1000)); // One hour from now
 *
 * // Compact the JWT to a Base64-URL encoded token
 *
 * var accessToken = jwt.compact();
 */

/**
 * @name  tokenResponse
 *
 * @type {Object}
 *
 * @memberOf OAuthClientCredentialsAuthenticationResult
 *
 * @description
 *
 * Exists if the authentication result was created for an OAuth Access Token
 * request, you should send this value as a application/json response to the
 * requester:
 *
 * @example
 * {
 *  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc ...",
 *  "expires_in": 3600,
 *  "token_type": "bearer",
 *  "scope": "given-scope"
 * }
 */

/**
 * @name  grantedScopes
 *
 * @type {Object}
 *
 * @memberOf OAuthClientCredentialsAuthenticationResult
 *
 * @description
 *
 * Exists if the authentication result was created from a previously issued
 * OAuth Access Token which has granted scopes, it will be an array of strings
 * which are the granted scopes.
 *
 * @example
 *
 * ['scope-a','scope-b']
 */