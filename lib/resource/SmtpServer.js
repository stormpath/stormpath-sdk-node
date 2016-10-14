'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

/**
 * @class SmtpServer
 *
 * @description
 * Encapsulates a SmtpServer resource. For full documentation of this resource, please see
 * [REST API Reference: SMTP Server](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#smtp-server).
 *
 * This class should not be manually constructed. It should be obtained from one of these methods:
 * - {@link Client#getSmtpServers Client.getSmtpServers()}
 * - {@link Tenant#getSmtpServers Tenant.getSmtpServers()}
 *
 * @augments {InstanceResource}
 *
 * @param {Object} smtpServerResource
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 */
function SmtpServer() {
  SmtpServer.super_.apply(this, arguments);
}

utils.inherits(SmtpServer, InstanceResource);

module.exports = SmtpServer;
