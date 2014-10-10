/**
* @author Alejandro Galue <agalue@opennms.org>
* @copyright 2014 The OpenNMS Group, Inc.
*/

'use strict';

describe('Controller: AssetController', function () {

  var scope, controllerFactory, mockModalInstance, asset = { key: 'admin', value: 'agalue' };

  function createController() {
    return controllerFactory('AssetController', {
      $scope: scope,
      $modalInstance: mockModalInstance,
      asset: asset
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
    expect(scope.asset.value).toBe(asset.value);
    expect(scope.assetFields[0]).toBe('additionalhardware');
  });

});