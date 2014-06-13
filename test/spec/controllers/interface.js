'use strict';

describe('Controller: InterfaceController', function () {

  var scope, controllerFactory, mockModalInstance, intf = { ipAddress: '10.0.0.1' };

  function createController() {
    return controllerFactory('InterfaceController', {
      $scope: scope,
      $modalInstance: mockModalInstance,
      intf: intf
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
    expect(scope.intf.ipAddress).toBe(intf.ipAddress);
    expect(scope.snmpPrimaryFields[0].title).toBe('Primary');
  });

});