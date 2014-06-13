/**
* @ngdoc object
* @name RequisitionNode
* @param {string} foreignSource the name of the foreign source (a.k.a. provisioning group)
* @param {Object} node an OpenNMS node JSON object
* @param {boolean} isDeployed true if the node has been deployed
* @constructor
*/
function RequisitionNode(foreignSource, node, isDeployed) {

  'use strict';

  var self = this;

  self.foreignSource = foreignSource;
  self.deployed = isDeployed;
  self.foreignId = node['foreign-id'];
  self.nodeLabel = node['node-label'];
  self.city = node['city'];
  self.building = node['building'];
  self.parentForeignSource = node['parent-foreign-source'];
  self.parentForeignId = node['parent-foreign-id'];
  self.parentForeignLabel = node['parent-foreign-label'];
  self.interfaces = [];
  self.categories = [];
  self.assets = [];

  angular.forEach(node['interface'], function(intf) {
    var interfaceObject = {
      ipAddress: intf['ip-addr'],
      description: intf['descr'],
      snmpPrimary: intf['snmp-primary'],
      status: intf['status'] === '1' ? 'managed' : 'unmanaged',
      services: []
    };

    angular.forEach(intf['monitored-service'], function(svc) {
      interfaceObject.services.push(svc['service-name']);
    });

    self.interfaces.push(interfaceObject);
  });

  angular.forEach(node['asset'], function(asset) {
    self.assets.push(asset);
  });

  angular.forEach(node['category'], function(cat) {
    self.categories.push(cat['name']);
  });

  self.getOnmsRequisitionNode = function() {
    var nodeObject = {
      'foreign-id': this.foreignId,
      'node-label': this.nodeLabel,
      'city': this.city,
      'building': this.building,
      'interface': [],
      'asset': [],
      'category': []
    };

    angular.forEach(this.interfaces, function(intf) {
      var interfaceObject = {
        'ip-addr': intf.ipAddress,
        'descr': intf.description,
        'snmp-primary': intf.snmpPrimary,
        'status': intf.status === 'managed' ? '1' : '3',
        'monitored-service': []
      };
      angular.forEach(intf.services, function(svc) {
        interfaceObject['monitored-service'].push({
          'service-name': svc
        });
      });

      nodeObject['interface'].push(interfaceObject);
    });

    angular.forEach(this.assets, function(asset) {
      nodeObject['asset'].push(asset);
    });

    angular.forEach(this.categories, function(category) {
      nodeObject['category'].push({ 'name' : category });
    });

    return nodeObject;
  };

  self.className = 'RequisitionNode';

  return self;
}