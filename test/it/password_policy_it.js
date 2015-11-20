'use strict';

var assert = require('assert');
var uuid = require('uuid');
var Client = require('../../lib/Client');

describe('PasswordPolicy', function() {
  describe('getStrength', function() {
    var client, directory;

    before(function (done) {
      client = new Client();

      client.on('error', function (err) {
        done(err);
      });

      client.on('ready', function () {
        done();
      });
    });

    after(function (done) {
      directory.delete(function(err) {
        done(err);
      });
    });

    it('should return the strength object', function (done) {
      client.createDirectory({ name: uuid.v4() }, function (err, dir) {
        if (err) {
          return done(err);
        }

        directory = dir;

        directory.getPasswordPolicy(function (err, policy) {
          if (err) {
            return done(err);
          }

          policy.getStrength(function (err, strength) {
            if (err) {
              return done(err);
            }

            assert(strength.href);
            done();
          });
        });
      });
    });
  });
});
