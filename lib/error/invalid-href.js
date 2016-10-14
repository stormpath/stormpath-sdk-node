'use strict';

/**
 * Produces an Erorr object with a message that indicates which resource type has
 * violated an href validation.
 *
 * @param      {string}  href          The href that was passed into a resource getter.
 * @param      {string}  resourceName  The human readable name of the expected resource type.
 * @return     {Error}   A simple error with the message
 */
function InvalidHrefError(href, resourceName){
  var message = 'Argument \'href\' (' + href + ') is not a valid ' + resourceName +' href.';
  return new Error(message);
}

module.exports = InvalidHrefError;
