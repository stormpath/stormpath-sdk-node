'use strict';
var util = require('util');
var InstanceResource = require('./resource').InstanceResource;

function Application(){
	Application.super_.apply(this, arguments);
}

util.inherits(Application, InstanceResource);

Application.prototype.login = function loginAttempt(requestObject, callback){
	var _this = this,
	username = requestObject.username,
	password = requestObject.password,
	type = requestObject.type || 'basic';

	
	var base64uidpassword = new Buffer(username+":"+password).toString('base64');

	this.dataStore.createResource(_this.loginAttempts.href+"?expand=account", {
		type: type,
		value: base64uidpassword
	}, callback);
}

Application.prototype.resetPassword = function resetPassword(requestObject, callback){
	var _this=this;

	this.dataStore.createResource(_this.passwordResetTokens.href, {
		email: requestObject.email
	}, callback);
}

Application.prototype.passwordReset = function passwordReset(requestObject, callback){
	var _this=this;

	this.dataStore.getResource(_this.passwordResetTokens.href+"/"+requestObject.token, callback);
}

module.exports = Application;
