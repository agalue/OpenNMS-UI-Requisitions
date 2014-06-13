/*global RequisitionInterface:true */

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
    self.interfaces.push(new RequisitionInterface(intf));
  });

  angular.forEach(node['asset'], function(asset) {
    self.assets.push(asset);
  });

  angular.forEach(node['category'], function(category) {
    self.categories.push(category);
  });

  self.addNewInterface = function() {
    this.interfaces.push(new RequisitionInterface({}));
    return this.interfaces.length - 1;
  };

  self.addNewAsset = function() {
    this.assets.add({
      name: '',
      value: ''
    });
    return this.assets.length -1;
  };

  self.addNewCategory = function() {
    this.categories.add({
      name: ''
    });
    return this.categories.length -1;
  };

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
      angular.forEach(intf.services, function(service) {
        interfaceObject['monitored-service'].push({
          'service-name': service.name
        });
      });

      nodeObject['interface'].push(interfaceObject);
    });

    angular.forEach(this.assets, function(asset) {
      nodeObject['asset'].push(asset);
    });

    angular.forEach(this.categories, function(category) {
      nodeObject['category'].push(category);
    });

    return nodeObject;
  };

  self.className = 'RequisitionNode';

  return self;
}
