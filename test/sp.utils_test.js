/*jshint expr: true*/
/*jshint unused: false*/
/* jshint -W030 */
'use strict';

var common = require('./common');
var utils = require('../lib/utils');
var expect = common.expect;
var assert = common.assert;

describe('util', function () {
  it('isAssignableFrom should work', function () {

    var A = function A(){};

    var B = function B() {
      A.super_.apply(this, arguments);
    };
    utils.inherits(B, A);

    utils.isAssignableFrom(Object, A).should.equal(true);

    utils.isAssignableFrom(Object, B).should.equal(true);

    utils.isAssignableFrom(A, B).should.equal(true);

    utils.isAssignableFrom(B, A).should.equal(false);

    utils.isAssignableFrom(B, Object).should.equal(false);

    utils.isAssignableFrom(A, Object).should.equal(false);

  });

  describe('valueOf method', function(){
    var obj = {test: 'me'};
    var def = {all: 'ok'};

    it('should return obj if obj not empty and default value not set', function(){
      var test = utils.valueOf(obj);
      test.should.be.equal(obj);
    });

    it('should return obj if obj not empty and default value are set', function(){
      var test = utils.valueOf(obj, def);
      test.should.be.equal(obj);
    });
    it('should return null if obj empty and default value not set', function(){
      var test = utils.valueOf(false);
      expect(test).to.be.null;
    });
    it('should return default if obj empty and default value are set', function(){
      var test = utils.valueOf(false, def);
      test.should.be.equal(def);
    });
  });

  describe('shallow copy', function(){
    function Class(){}
    Class.prototype.field = 'boom!';
    var objToCopy = new Class();
    objToCopy.prop = 'here I am';
    var dest = new Class();
    dest.prop = 'will be overridden';
    dest.prop2 = 'should be in object';

    var result = utils.shallowCopy(objToCopy, dest);

    it('should copy own fields', function(){
      dest.should.have.keys(['prop', 'prop2']);
      dest.prop.should.be.deep.equal(objToCopy.prop);
    });

    it('should not copy class properties', function(){
      dest.should.not.have.key('field');
    });
  });

  describe('is assignable from', function(){
    function testF(ctor, toTest){
      return function(){
        utils.isAssignableFrom(ctor, toTest);
      };
    }
    it('should throw error if ctor or toTest not a function',function(){
      testF({}).should.throw(/must be function/i);
      testF(function(){},{})
        .should.throw(/must be function/i);
    });
    it('should not throw if both params are function', function(){
      testF(function(){}, function(){}).should.not.throw();
    });

    it('should return true if ctor is Object', function(){
      utils.isAssignableFrom(Object, function(){}).should.be.ok;
    });
    it('should return true if ctor is equal to testCtor', function(){
      function Class(){}
      utils.isAssignableFrom(Class,Class).should.be.ok;
    });
    it('should return true if ctor is equal to testCtor parent constructor', function(){
      function A(){}
      function B(){}
      function C(){}
      A.super_ = B;
      B.super_ = C;
      utils.isAssignableFrom(C,A).should.be.ok;
    });
  });

  describe('base64', function(){
    var test = 'boom!';
    utils.base64.decode(utils.base64.encode(test)).should.be.equal(test);
  });

  describe('isNumber', function(){
    describe('0',function(){
      it('should be true',function(){
        assert.isTrue(utils.isNumber(0));
      });
    });
    describe('1',function(){
      it('should be true',function(){
        assert.isTrue(utils.isNumber(1));
      });
    });
    describe('"1"',function(){
      it('should be false',function(){
        assert.isFalse(utils.isNumber("1"));
      });
    });
    describe('NaN',function(){
      it('should be false',function(){
        assert.isFalse(utils.isNumber(NaN));
      });
    });
    describe('parseInt("a")',function(){
      it('should be false',function(){
        assert.isFalse(utils.isNumber(parseInt("a",10)));
      });
    });
  });


});
