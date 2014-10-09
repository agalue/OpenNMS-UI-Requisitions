/*global Requisition:true */

'use strict';

describe('Controller: RequisitionController', function () {

  // Initialize testing environment

  var controllerFactory, scope, $q, mockGrowl = {}, mockRequisitionsService = {}, foreignSource = 'test-requisition', requisition = new Requisition(foreignSource);

  function createController() {
    return controllerFactory('RequisitionController', {
      $scope: scope,
      $routeParams: { 'foreignSource': foreignSource },
      RequisitionsService: mockRequisitionsService,
      growl: mockGrowl
    });
  }

  beforeEach(module('onms-requisitions', function($provide) {
    $provide.value('$log', console);
  }));

  beforeEach(inject(function($rootScope, $controller, _$q_) {
    scope = $rootScope.$new();
    controllerFactory = $controller;
    $q = _$q_;
  }));

  beforeEach(function() {
    mockRequisitionsService.getRequisition = jasmine.createSpy('getRequisition');
    var requisitionDefer = $q.defer();
    requisitionDefer.resolve(requisition);
    mockRequisitionsService.getRequisition.andReturn(requisitionDefer.promise);

    mockGrowl = {
      addWarnMessage: function(msg) { console.warn(msg); },
      addErrorMessage: function(msg) { console.error(msg); },
      addInfoMessage: function(msg) { console.info(msg); },
      addSuccessMessage: function(msg) { console.info(msg); }
    };
  });

  it('test controller', function() {
    createController();
    scope.$digest();
    expect(mockRequisitionsService.getRequisition).toHaveBeenCalledWith(foreignSource);
    expect(scope.foreignSource).toBe(foreignSource);
  });

});
