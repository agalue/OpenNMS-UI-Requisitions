'use strict';

describe('Service: RequisitionsService', function () {

  var deployedRequisitions = {
    'count': 2,
    'model-import': [{
      'foreign-source' : 'test-network',
      'node': [{
        'foreign-id': '1001',
        'node-label': 'testing-server',
        'building' : 'Office',
        'interface': [{
          'ip-addr': '10.0.0.1',
          'descr': 'eth0',
          'snmp-primary': 'P',
          'status': '1',
          'monitored-service': [{
            'service-name': 'ICMP'
          }]
        }],
        'asset': [{
          'name': 'address1',
          'value': '220 Chatham Business Drive'
        },{
          'name': 'city',
          'value': 'Pittsboro'
        }],
        'category': [{
          'name': 'Servers'
        }]
      }, {
        'foreign-id': '1003',
        'node-label': 'testing-switch',
        'interface': [{
          'ip-addr': '10.0.0.3',
          'descr': 'Fa0/0',
          'snmp-primary': 'P',
          'status': '1'
        }]
      }]
    },{
      'foreign-source' : 'test-monitoring',
      'node': [{
        'foreign-id': 'onms',
        'node-label': 'onms-server',
        'interface': [{
          'ip-addr': '11.0.0.1',
          'descr': 'eth0',
          'snmp-primary': 'P',
          'status': '1'
        }]
      }]
    }]
  };

  var pendingRequisitions = {
    'count': 2,
    'model-import': [{
      'foreign-source' : 'test-network', // Modified requisition
      'node': [{
        'foreign-id': '1001', // Unmodified node
        'node-label': 'testing-server',
        'building' : 'Office',
        'interface': [{
          'ip-addr': '10.0.0.1',
          'descr': 'eth0',
          'snmp-primary': 'P',
          'status': '1',
          'monitored-service': [{
            'service-name': 'ICMP'
          }]
        }],
        'asset': [{
          'name': 'address1',
          'value': '220 Chatham Business Drive'
        },{
          'name': 'city',
          'value': 'Pittsboro'
        }],
        'category': [{
          'name': 'Servers'
        }]
      },{
        'foreign-id': '1002', // New node
        'node-label': 'testing-router',
        'building' : 'Office',
        'interface': [{
          'ip-addr': '10.0.0.2',
          'descr': 'Fa0/0',
          'snmp-primary': 'P',
          'status': '1'
        }],
        'category': [{
          'name': 'Routers'
        }]
      },{
        'foreign-id': '1003', // Modified node
        'node-label': 'testing-switch',
        'interface': [{
          'ip-addr': '10.0.0.4', // New IP
          'descr': 'Fa0/1', // New Description
          'snmp-primary': 'P',
          'status': '1'
        }]
      }]
    },{
      'foreign-source' : 'test-empty', // New requisition
      'node': []
    }]
  };

  // Initialize testing environment

  var scope, $httpBackend, requisitionsService;

  beforeEach(module('onms-requisitions', function($provide) {
    $provide.value('$log', console);    
  }));

  beforeEach(inject(function($injector) {
    scope = $injector.get('$rootScope').$new();
    $httpBackend = $injector.get('$httpBackend');
    requisitionsService = $injector.get('RequisitionsService');
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  // Testing getRequisitions
  it('getRequisitions', function() {
    var requisitionsUrl = requisitionsService.internal.requisitionsUrl;
    $httpBackend.expect('GET', requisitionsUrl).respond(pendingRequisitions);
    $httpBackend.expect('GET', requisitionsUrl + '/deployed').respond(deployedRequisitions);

    var handlerFn = function(data) {
      expect(data).not.toBe(null);
      expect(data.requisitions.length).toBe(3);
      expect(data.requisitions[0].foreignSource).toBe('test-network');
      expect(data.requisitions[0].deployed).toBe(false);
      expect(data.requisitions[0].nodes.length).toBe(3);
      expect(data.requisitions[0].nodes[0].foreignId).toBe('1001');
      expect(data.requisitions[0].nodes[0].deployed).toBe(true);  // unmodified
      expect(data.requisitions[0].nodes[1].foreignId).toBe('1003');
      expect(data.requisitions[0].nodes[1].deployed).toBe(false); // modified
      expect(data.requisitions[0].nodes[2].foreignId).toBe('1002');
      expect(data.requisitions[0].nodes[2].deployed).toBe(false); // new
      expect(data.requisitions[1].foreignSource).toBe('test-monitoring');
      expect(data.requisitions[1].deployed).toBe(true);
      expect(data.requisitions[1].nodes.length).toBe(1);
    };

    requisitionsService.getRequisitions().then(handlerFn);

    $httpBackend.flush();

    expect(requisitionsService.internal.getCachedRequisitionsData()).not.toBe(null);

    // The following calls should use internal cache

    requisitionsService.getRequisitions().then(handlerFn);
    requisitionsService.getRequisition('test-network').then(function(r) {
      expect(r).not.toBe(null);
      expect(r.foreignSource).toBe('test-network');
    })
    requisitionsService.getNode('test-network', '1001').then(function(n) {
      expect(n).not.toBe(null);
      expect(n.foreignId).toBe('1001');
    })

  });

  // Testing getRequisition

  it('getRequisition', function() {
    var req = pendingRequisitions['model-import'][0];
    var fs  = req['foreign-source'];
    var requisitionUrl = requisitionsService.internal.requisitionsUrl + '/' + fs;
    $httpBackend.expect('GET', requisitionUrl).respond(req);

    var handlerFn = function(data) {
      expect(data).not.toBe(null);
      expect(data.nodes.length).toBe(3);
    };

    requisitionsService.getRequisition(fs).then(handlerFn);

    $httpBackend.flush();
  });

  // Testing synchronizeRequisition

  it('synchronizeRequisition', function() {
    var foreignSource = 'test-requisition';
    var importUrl = requisitionsService.internal.requisitionsUrl + '/' + foreignSource + '/import?rescanExisting=false';
    $httpBackend.expect('PUT', importUrl).respond({});

    requisitionsService.synchronizeRequisition(foreignSource);
    $httpBackend.flush();
  });

  // Testing addRequisition

  it('addRequisition', function() {
    var foreignSource = 'test-requisition';
    var emptyReq = { 'foreign-source': foreignSource, node: [] };
    var requisition = new Requisition(emptyReq, false);
    var addUrl = requisitionsService.internal.requisitionsUrl;
    $httpBackend.expect('POST', addUrl, emptyReq).respond(requisition);

    requisitionsService.addRequisition(foreignSource).then(function(requisition) {
      expect(requisition.foreignSource).toBe(foreignSource);
    });
    $httpBackend.flush();
  });

  // Testing deleteRequisition (pending)

  it('deleteRequisition::pending', function() {
    var foreignSource = 'test-requisition';
    var deleteUrl = requisitionsService.internal.requisitionsUrl + '/' + foreignSource;
    $httpBackend.expect('DELETE', deleteUrl).respond({});

    requisitionsService.deleteRequisition(foreignSource);
    $httpBackend.flush();
  });

  // Testing deleteRequisition (deployed)

  it('deleteRequisition::deployed', function() {
    var foreignSource = 'test-requisition';
    var deleteUrl = requisitionsService.internal.requisitionsUrl + '/deployed/' + foreignSource;
    $httpBackend.expect('DELETE', deleteUrl).respond({});

    requisitionsService.deleteRequisition(foreignSource, true);
    $httpBackend.flush();
  });

  // Testing removeAllNodesFromRequisition

  it('removeAllNodesFromRequisition', function() {
    var requisition = {'model-import': 'test-requisition', node: []};
    var saveUrl = requisitionsService.internal.requisitionsUrl;
    $httpBackend.expect('POST', saveUrl, requisition).respond({});

    requisitionsService.removeAllNodesFromRequisition('test-requisition');
    $httpBackend.flush();
  });

  // Testing getNode

  it('getNode', function() {
    var req  = pendingRequisitions['model-import'][0];
    var node = req['node'][0];
    var fs   = req['foreign-source'];
    var fid  = node['foreign-id'];
    var nodeUrl = requisitionsService.internal.requisitionsUrl + '/' + fs + '/nodes/' + fid;
    $httpBackend.expect('GET', nodeUrl).respond(node);

    var handlerFn = function(data) {
      expect(data).not.toBe(null);
      expect(data.nodeLabel).toBe('testing-server');
    };

    requisitionsService.getNode(fs, fid).then(handlerFn);

    $httpBackend.flush();
  });

  // Testing saveNode

  it('saveNode', function() {
    var node = new RequisitionNode('test-equisition', { 'foreign-id': '10', 'node-label': 'test' }, false);
    var saveUrl = requisitionsService.internal.requisitionsUrl + '/test-equisition/nodes';
    $httpBackend.expect('POST', saveUrl, node.getOnmsRequisitionNode()).respond({});

    requisitionsService.saveNode(node);
    $httpBackend.flush();

  });

  // Testing deleteNode

  it('deleteNode', function() {
    var node = new RequisitionNode('test-equisition', { 'foreign-id': '10', 'node-label': 'test' }, false);
    var deleteUrl = requisitionsService.internal.requisitionsUrl + '/test-equisition/nodes/10';
    $httpBackend.expect('DELETE', deleteUrl).respond({});

    requisitionsService.deleteNode(node);
    $httpBackend.flush();
  });

});