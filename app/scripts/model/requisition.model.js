/* global moment: true */

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

    /**
    * @description
    * @ngdoc property
    * @name Requisition#deployed
    * @propertyOf Requisition
    * @returns {boolean} True if the requisition has been deployed
    */
    self.deployed = isDeployed;

    /**
    * @description
    * @ngdoc property
    * @name Requisition#foreignSource
    * @propertyOf Requisition
    * @returns {string} The foreign source name (a.k.a. requisition name)
    */
    self.foreignSource = requisition['foreign-source'];

    self.dateStamp = requisition['date-stamp'];
    self.lastImport = requisition['last-import'];
    self.nodesInDatabase = 0;
    self.nodesDefined = 0;
    self.nodes = {};

    angular.forEach(requisition.node, function(node) {
      var requisitionNode = new RequisitionNode(self.foreignSource, node, isDeployed);
      self.nodes[requisitionNode.foreignId] = requisitionNode;
    });

    self.nodesCount = function() {
      var count = 0;
      for (var key in this.nodes) {
        if (this.nodes.hasOwnProperty(key)) {
          count++;
        }
      }
      return count;
    }

    self.updateStats = function() {
      if (this.deployed) {
        this.nodesInDatabase = this.nodesDefined = self.nodesCount();
      } else {
        this.nodesDefined = self.nodesCount();
      }
    }

    self.setDeployed = function(deployed) {
      this.deployed = deployed;
      for (var foreignId in this.nodes) {
        this.nodes[foreignId].deployed = deployed;
      }
      this.updateStats();
    };

    self.updateStats();

    self.className = 'Requisition';

    return self;
  }