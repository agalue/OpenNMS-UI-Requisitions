/*global RequisitionNode:true */

/**
* @ngdoc object
* @name Requisition
* @param {Object} requisition an OpenNMS requisition JSON object
* @param {boolean} isDeployed true if the requisition has been deployed
* @constructor
*/
function Requisition(requisition, isDeployed) {

  'use strict';

  var self = this;

  self.deployed = isDeployed;
  self.foreignSource = requisition['foreign-source'];
  self.dateStamp = requisition['date-stamp'];
  self.lastImport = requisition['last-import'];
  self.nodesInDatabase = 0;
  self.nodesDefined = 0;
  self.nodes = [];

  angular.forEach(requisition.node, function(node) {
    var requisitionNode = new RequisitionNode(self.foreignSource, node, isDeployed);
    self.nodes.push(requisitionNode);
  });

  self.indexOf = function(foreignId) {
    for(var i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].foreignId === foreignId) {
        return i;
      }
    }
    return -1;
  };

  self.updateStats = function() {
    if (this.deployed) {
      this.nodesInDatabase = this.nodesDefined = this.nodes.length;
    } else {
      this.nodesDefined = this.nodes.length;
    }
  };

  self.setDeployed = function(deployed) {
    this.deployed = deployed;
    angular.forEach(this.nodes, function(node) {
      node.deployed = deployed;
    });
    this.updateStats();
  };

  self.updateStats();

  self.className = 'Requisition';

  return self;
}