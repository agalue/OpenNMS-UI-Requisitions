'use strict';

describe('Controller: PolicyController', function () {

  var scope, controllerFactory, mockModalInstance, policy = { name: 'MyPolicy' };

  function createController() {
    return controllerFactory('PolicyController', {
      $scope: scope,
      $modalInstance: mockModalInstance,
      policy: policy
    });
  };

  beforeEach(module('onms-requisitions', function($provide) {
    $provide.value('$log', console);    
  }));

  beforeEach(inject(function($rootScope, $controller) {
    scope = $rootScope.$new();
    controllerFactory = $controller;
  }));

  beforeEach(function() {
    mockModalInstance = {
      close: function(obj) { console.info(obj); },
      dismiss: function(msg) { console.info(msg); }
    };
  });

  it('test controller', function() {
    createController();
    scope.$digest();
    expect(scope.policy.name).toBe(policy.name);
  });

});