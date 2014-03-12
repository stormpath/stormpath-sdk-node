'use strict';

describe('Controller: MainNavController', function () {

  // load the controller's module
  beforeEach(module('docsApp'));

  var MainNavController,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainNavController = $controller('MainNavController', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
