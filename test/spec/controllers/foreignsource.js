'use strict';

describe('Controller: ForeignSourceController', function () {

  var controllerFactory, scope, $q, mockModal = {}, mockGrowl = {}, mockRequisitionsService = {}, foreignSource = 'test-requisition';

  function createController() {
    return controllerFactory('ForeignSourceController', {
      $scope: scope,
      $routeParams: { 'foreignSource': foreignSource },
      $modal: mockModal,
      RequisitionsService: mockRequisitionsService,
      growl: mockGrowl
    });
  }

  beforeEach(module('onms-requisitions', function($provide) {
    $provide.value('$log', console);
  }));

  beforeEach(inject(function($rootScope, $controller, _$q_) {
    scope = $rootScope.$new();
    $q = _$q_;
    controllerFactory = $controller;
  }));

  beforeEach(function() {
    mockModal = {};

    mockRequisitionsService.getForeignSourceDefinition = jasmine.createSpy('getForeignSourceDefinition');
    var requisitionDefer = $q.defer();
    requisitionDefer.resolve({ detectors: [], policies: [] });
    mockRequisitionsService.getForeignSourceDefinition.andReturn(requisitionDefer.promise);

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
    expect(mockRequisitionsService.getForeignSourceDefinition).toHaveBeenCalledWith(foreignSource);
    expect(scope.foreignSource).toBe(foreignSource);
  });

});
