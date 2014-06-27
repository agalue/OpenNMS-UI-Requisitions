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
    for(var i = 0; i < self.nodes.length; i++) {
      if (self.nodes[i].foreignId === foreignId) {
        return i;
      }
    }
    return -1;
  };

  self.updateStats = function() {
    if (self.deployed) {
      self.nodesInDatabase = self.nodes.length;
    } else {
      self.nodesDefined = self.nodes.length;
    }
  };

  self.setDeployed = function(deployed) {
    self.deployed = deployed;
    angular.forEach(self.nodes, function(node) {
      node.deployed = deployed;
    });
    self.updateStats();
  };

  self.updateStats();

  self.className = 'Requisition';

  return self;
}