'use strict';

describe('Controller: DummyController', function () {

  var scope, controllerFactory;

  function createController() {
    return controllerFactory('DummyController', {
      $scope: scope,
    });
  };

  beforeEach(module('onms-requisitions', function($provide) {
    $provide.value('$log', console);    
  }));

  beforeEach(inject(function($rootScope, $controller) {
    scope = $rootScope.$new();
    controllerFactory = $controller;
  }));

  it('test controller', function() {
    createController();
    scope.$digest();
    expect(scope.developerName).toBe('Alejandro');
  });

});