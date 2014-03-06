'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

function Tenant() {
  Tenant.super_.apply(this, arguments);
}
utils.inherits(Tenant, InstanceResource);

Tenant.prototype.createApplication = function createTenantApplication(/*app, options, callback*/) {

  var args = Array.prototype.slice.call(arguments);

  var app = utils.valueOf(args[0]);

  var callback = args[args.length -1]; //callback is always last

  var options = null;

  var secondToLastArg = args[args.length - 2];
  if (secondToLastArg && secondToLastArg !== app) {
    //options provided:
    options = secondToLastArg;
  }

  var parentHref = '/applications'; //Yuck: should be _this.applications.href.  Need to fix server side.

  this.dataStore.createResource(parentHref, options, app, InstanceResource, callback);
};

module.exports = Tenant;