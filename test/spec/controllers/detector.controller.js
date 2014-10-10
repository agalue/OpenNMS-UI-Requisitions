/**
* @author Alejandro Galue <agalue@opennms.org>
* @copyright 2014 The OpenNMS Group, Inc.
*/

'use strict';

describe('Controller: DetectorController', function () {

  var scope, $q, controllerFactory, mockModalInstance, mockRequisitionsService = {},
    detector = { name: 'HTTP', class: 'org.opennms.netmgt.provision.http.HttpDetector' };

  function createController() {
    return controllerFactory('DetectorController', {
      $scope: scope,
      $modalInstance: mockModalInstance,
      RequisitionsService: mockRequisitionsService,
      detector: detector
    });
  };

  beforeEach(module('onms-requisitions', function($provide) {
    $provide.value('$log', console);    
  }));

  beforeEach(inject(function($rootScope, $controller, _$q_) {
    scope = $rootScope.$new();
    controllerFactory = $controller;
    $q = _$q_;
  }));

  beforeEach(function() {
    mockRequisitionsService.getAvailableDetectors = jasmine.createSpy('getAvailableDetectors');
    var detectors = $q.defer();
    detectors.resolve([
      { 'name': 'ICMP', 'class': 'org.opennms.netmgt.provision.detector.icmp.IcmpDetector' },
      { 'name': 'SNMP', 'class': 'org.opennms.netmgt.provision.detector.snmp.SnmpDetector' }
    ]);
    mockRequisitionsService.getAvailableDetectors.andReturn(detectors.promise);

    mockModalInstance = {
      close: function(obj) { console.info(obj); },
      dismiss: function(msg) { console.info(msg); }
    };
  });

  it('test controller', function() {
    createController();
    scope.$digest();
    expect(scope.detector.name).toBe(detector.name);
    expect(scope.detector.class).toBe(detector.class);
    expect(scope.availableDetectors.length).toBe(2);
    expect(scope.availableDetectors[0].name).toBe('ICMP');

    // Auto-select the class for a specific detector implementation based on the name
    scope.setClassForName({'name': 'ICMP', 'class': 'org.opennms.netmgt.provision.detector.icmp.IcmpDetector'});
    expect(scope.detector.class).toBe('org.opennms.netmgt.provision.detector.icmp.IcmpDetector');

    // Clear the detector class for an unknown or new service name.
    scope.setClassForName({'name': 'CITRIX', 'class': 'org.opennms.netmgt.provision.detector.tcp.TcpDetector'});
    expect(scope.detector.class).toBe(null);

    // Auto-select the name for a specific detector implementation if the name is not set.
    scope.detector.name = null;
    scope.setNameForClass({'name': 'ICMP', 'class': 'org.opennms.netmgt.provision.detector.snmp.SnmpDetector'});
    expect(scope.detector.name).toBe('SNMP');

    // Do not touch the detector name after selecting an implementation if it was already set.
    scope.setNameForClass({'name': 'ICMP', 'class': 'org.opennms.netmgt.provision.detector.snmp.SnmpDetector'});
    expect(scope.detector.name).toBe('SNMP');
  });

});