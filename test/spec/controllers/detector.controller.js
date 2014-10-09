'use strict';

describe('Controller: DetectorController', function () {

  var scope, controllerFactory, mockModalInstance, detector = { name: 'HTTP' };

  function createController() {
    return controllerFactory('DetectorController', {
      $scope: scope,
      $modalInstance: mockModalInstance,
      detector: detector
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
    expect(scope.detector.name).toBe(detector.name);
  });

});