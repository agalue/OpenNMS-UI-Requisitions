/*global RequisitionsData:true,Requisition:true,RequisitionNode:true */

// http://jsfiddle.net/zMjVp/

(function() {

  'use strict';

  angular.module('onms-requisitions')

  /**
  * @ngdoc service
  * @name RequisitionsService
  *
  * @description The RequisitionsService provides components with access to the OpenNMS requisitions REST resource.
  */
  .factory('RequisitionsService', ['$q', '$http', '$log', function($q, $http, $log) {

    $log.debug('Initializing RequisitionsService');

    var requisitionsService = {};
    requisitionsService.internal = {};

    requisitionsService.internal.requisitionsUrl   = '/opennms/rest/requisitions';
    requisitionsService.internal.foreignSourcesUrl = '/opennms/rest/foreignSources';

    /**
    * @description (Internal) Merges the deployed and pending requisitions obtained from OpenNMS into a single object.
    *
    * @name RequisitionService:internal.mergeData
    * @ngdoc method
    * @methodOf RequisitionService
    * @param {Array} The OpenNMS requisitions obtained from the ReST API, [pending, deployed]
    * @returns {Object} the combined data.
    * @private
    */
    requisitionsService.internal.mergeRequisitions = function(results) {
      var pendingRequisitions  = results[0].data;
      var deployedRequisitions = results[1].data;
      var requisitionsData = new RequisitionsData();

      // Assumes the deployed nodes are going to be added first and then the pending nodes.
      var mergeRequisition = function(req, deployed) {
        var requisition = new Requisition(req, deployed);
        requisitionsData.status[deployed ? 'deployed' : 'pending']++;
        var existingReqIndex = requisitionsData.indexOf(requisition.foreignSource);
        if (existingReqIndex < 0) {
          $log.debug('mergeRequisition: adding ' + (deployed ? 'deployed' : 'pending') + ' requisition ' + requisition.foreignSource + '.');
          requisitionsData.requisitions.push(requisition);
        } else {
          var existingReq = requisitionsData.requisitions[existingReqIndex];
          existingReq.deployed = false; // temporary set to false to compare the requisitions.
          if (angular.equals(existingReq, requisition)) { // the requisition was not modified.
            existingReq.deployed = true; // restoring the deployed flag.
            $log.debug('mergeRequisition: the foreignSource ' + requisition.foreignSource + ' has not been modified.');
          } else { // the requisition was modified
            $log.debug('mergeRequisition: the foreignSource ' + requisition.foreignSource + ' has been modified.');
            for (var idx = 0; idx < requisition.nodes.length; idx++) {
              var currentNode = requisition.nodes[idx];
              var existingNodeIndex = existingReq.indexOf(currentNode.foreignId);
              if (existingNodeIndex < 0) { // new node
                $log.debug('mergeRequisition: the foreignId ' + currentNode.foreignId + ' is new, adding it to ' + requisition.foreignSource + '.');
                existingReq.nodes.push(currentNode);
              } else { // modified node ?
                var existingNode = existingReq.nodes[existingNodeIndex];
                existingNode.deployed = false; // temporary set to false to compare the nodes.
                if (angular.equals(existingNode, currentNode)) { // ummodified node.
                  $log.debug('mergeRequisition: the foreignId ' + currentNode.foreignId + ' has not been modified on ' + requisition.foreignSource + '.');
                  existingNode.deployed = true; // restoring the deployed flag.
                } else { // modified node
                  $log.debug('mergeRequisition: the foreignId ' + currentNode.foreignId + ' was modified, replacing it into ' + requisition.foreignSource + '.');
                  existingReq.nodes[existingNodeIndex] = currentNode;
                }
              }
            }
          }
        }
      };

      $log.debug('mergeRequisitions: processing deployed requisitions');
      angular.forEach(deployedRequisitions['model-import'], function(r) {
        mergeRequisition(r, true);
      });

      $log.debug('mergeRequisitions: processing pending requisitions');
      angular.forEach(pendingRequisitions['model-import'], function(r) {
        mergeRequisition(r, false);
      });


      return requisitionsData;
    };

    /**
    * @description Requests all the requisitions (pending and deployed) from OpenNMS.
    *
    * @name RequisitionService:getRequisitions
    * @ngdoc method
    * @methodOf RequisitionService
    * @returns {*} a handler function.
    */
    requisitionsService.getRequisitions = function() {
      var pendingUrl  = requisitionsService.internal.requisitionsUrl;
      var deployedUrl = requisitionsService.internal.requisitionsUrl + '/deployed';

      $log.debug('getRequisitions: retrieving pending and deployed requisitions.');
      var deferredPending  = $http.get(pendingUrl);
      var deferredDeployed = $http.get(deployedUrl);

      $log.debug('getRequisitions: merging pending and deployed requisitions.');
      var deferredResults = $q.defer();
      $q.all([ deferredPending, deferredDeployed ])
      .then(function(results) {
        var requisitionsData = requisitionsService.internal.mergeRequisitions(results);
        $log.debug('getRequisitions: merged pending and deployed requisitions.');
        deferredResults.resolve(requisitionsData);
      }, function(message) {
        var status = 'cannot merge the requisitions. ' + message;
        $log.error('getRequisitions: ' + status);
        deferredResults.reject(status);
      });

      return deferredResults.promise;
    };

    /**
    * @description Request a sepcific requisition from OpenNMS.
    *
    * @name RequisitionService:getRequisition
    * @ngdoc method
    * @param {string} The requisition's name (a.k.a. foreignSource)
    * @methodOf RequisitionService
    * @returns {*} a handler function.
    */
    requisitionsService.getRequisition = function(foreignSource) {
      var url  = requisitionsService.internal.requisitionsUrl + '/' + foreignSource;
      var deferred = $q.defer();
      $log.debug('getRequisition: getting requisition ' + foreignSource);
      $http.get(url)
      .success(function(data) {
        var requisition = new Requisition(data);
        $log.debug('getRequisition: got requisition ' + foreignSource);
        deferred.resolve(requisition);
      })
      .error(function(data, status) {
        $log.error('getRequisition: GET ' + url + ' failed:', data, status);
        deferred.reject(status);
      });
      return deferred.promise;
    };

    /**
    * @description Request the synchronization/import of a requisition on the OpenNMS server.
    * The controler is responsible for update the status of the requisition object,
    * after a successful synchronization.
    *
    * @name RequisitionService:synchronizeRequisition
    * @ngdoc method
    * @methodOf RequisitionService
    * @param {string} The requisition's name (a.k.a. foreignSource)
    * @param {boolean} Flag for to scan existing nodes
    * @returns {*} a handler function.
    */
    requisitionsService.synchronizeRequisition = function(foreignSource, rescanExisting) {
      var url = requisitionsService.internal.requisitionsUrl + '/' + foreignSource + '/import';
      var deferred = $q.defer();
      $log.debug('synchronizeRequisition: synchronizing requisition ' + foreignSource);
      $http({ method: 'PUT', url: url, params: { rescanExisting: rescanExisting ? 'true' : 'false' }})
      .success(function(data) {
        $log.debug('synchronizeRequisition: synchronized requisition ' + foreignSource);
        deferred.resolve(data);
      })
      .error(function(data, status) {
        $log.error('synchronizeRequisition: PUT ' + url + ' failed:', data, status);
        deferred.reject(status);
      });
      return deferred.promise;
    };

    /**
    * @description Request the creation of a new requisition on the OpenNMS server.
    * The controller must ensure that the foreignSource is unique.
    *
    * @name RequisitionService:addRequisition
    * @ngdoc method
    * @methodOf RequisitionService
    * @param {string} The requisition's name (a.k.a. foreignSource)
    * @returns {*} a handler function.
    */
    requisitionsService.addRequisition = function(foreignSource) {
      var emptyReq = { 'foreign-source': foreignSource, node: [] };
      var url = requisitionsService.internal.requisitionsUrl;
      var deferred = $q.defer();
      $log.debug('addRequisition: adding requisition ' + foreignSource);
      $http.post(url, emptyReq)
      .success(function() {
        var requisition = new Requisition(emptyReq, false);
        $log.debug('addRequisition: added requisition ' + requisition.foreignSource);
        deferred.resolve(requisition);
      }).error(function(data, status) {
        $log.error('addRequisition: POST ' + url + ' failed:', data, status);
        deferred.reject(status);
      });
      return deferred.promise;
    };

    /**
    * @description Request the deletion of a new requisition on the OpenNMS server.
    * The controller must ensure that the requisition contains no nodes.
    *
    * @name RequisitionService:deleteRequisition
    * @ngdoc method
    * @methodOf RequisitionService
    * @param {string}  The requisition's name (a.k.a. foreignSource)
    * @param {boolean} true, if the requisition is deployed
    * @returns {*} a handler function.
    */
    requisitionsService.deleteRequisition = function(foreignSource, deployed) {
      var deferred = $q.defer();
      var url = requisitionsService.internal.requisitionsUrl + (deployed ? '/deployed/' : '/') + foreignSource;
      $log.debug('deleteRequisition: deleting ' + (deployed ? 'deployed' : 'pending') + ' requisition ' + foreignSource);
      $http.delete(url)
      .success(function(data) {
        $log.debug('deleteRequisition: deleted ' + (deployed ? 'deployed' : 'pending')+ ' requisition ' + foreignSource);
        deferred.resolve(data);
      }).error(function(data, status) {
        $log.error('addRequisition: DELETE ' + url + ' failed:', data, status);
        deferred.reject(status);
      });
      return deferred.promise;
    };

    /**
    * @description Request the removal of all from an existing requisition on the OpenNMS server.
    * The controller must ensure that the requisition exist.
    * The controller is responsible for update the status of the requisition object,
    * after a successful removal.
    *
    * @name RequisitionService:removeAllNodesFromRequisition
    * @ngdoc method
    * @methodOf RequisitionService
    * @param {string} The requisition's name (a.k.a. foreignSource)
    * @returns {*} a handler function.
    */
    requisitionsService.removeAllNodesFromRequisition = function(foreignSource) {
      var deferred = $q.defer();
      var requisition = {'model-import': foreignSource, node: []};
      var url = requisitionsService.internal.requisitionsUrl;
      $log.debug('removeAllNodesFromRequisition: removing nodes from requisition ' + foreignSource);
      $http.post(url, requisition)
      .success(function(data) {
        $log.debug('removeAllNodesFromRequisition: removed nodes requisition ' + foreignSource);
        deferred.resolve(data);
      }).error(function(data, status) {
        $log.error('removeAllNodesFromRequisition: POST ' + url + ' failed:', data, status);
        deferred.reject(status);
      });
      return deferred.promise;
    };

    /**
    * @description Request a sepcific node from a requisition from OpenNMS.
    *
    * @name RequisitionService:getNode
    * @ngdoc method
    * @param {string} The requisition's name (a.k.a. foreignSource)
    * @param {string} The foreignId of the node
    * @methodOf RequisitionService
    * @returns {*} a handler function.
    */
    requisitionsService.getNode = function(foreignSource, foreignId) {
      var url  = requisitionsService.internal.requisitionsUrl + '/' + foreignSource + '/nodes/' + foreignId;
      var deferred = $q.defer();
      $log.debug('getRequisition: getting node ' + foreignId + '@' + foreignSource);
      $http.get(url)
      .success(function(data) {
        var node = new RequisitionNode(foreignSource, data);
        $log.debug('getNode: got node ' + foreignId + '@' + foreignSource);
        deferred.resolve(node);
      })
      .error(function(data, status) {
        $log.error('getNode: GET ' + url + ' failed:', data, status);
        deferred.reject(status);
      });
      return deferred.promise;
    };

    /**
    * @description Updates a node on an existing requisition on the OpenNMS server.
    * The controler is responsible for update the status of the requisition object,
    * after a successful operation, depending if the save operation is related with the
    * update of an existing node, or if it is related with the creating of a new node.
    * The controller must ensure that the foreignId is unique within the requisition.
    *
    * @name RequisitionService:removeAllNodesFromRequisition
    * @ngdoc method
    * @methodOf RequisitionService
    * @param {Object} The RequisitionNode Object
    * @returns {*} a handler function.
    */
    requisitionsService.saveNode = function(node) {
      var deferred = $q.defer();
      var requisitionNode = node.getOnmsRequisitionNode();
      var url = requisitionsService.internal.requisitionsUrl + '/' + node.foreignSource + '/nodes';
      $log.debug('saveNode: saving node ' + node.nodeLabel + ' on requisition ' + node.foreignSource);
      $http.post(url, requisitionNode)
      .success(function(data) {
        node.deployed = false;
        $log.debug('saveNode: saved node ' + node.nodeLabel + ' on requisition ' + node.foreignSource);
        deferred.resolve(data);
      }).error(function(data, status) {
        $log.error('saveNode: POST ' + url + ' failed:', data, status);
        deferred.reject(status);
      });
      return deferred.promise;
    };

    /**
    * @description Request the removal of a node from an existing requisition on the OpenNMS server.
    * The controller must ensure that the requisition exist, and the node is part of the requisition.
    * The controler is responsible for update the status of the requisition object,
    * after a successful removal.
    *
    * @name RequisitionService:deleteNode
    * @ngdoc method
    * @methodOf RequisitionService
    * @param {Object} The RequisitionNode Object
    * @returns {*} a handler function.
    */
    requisitionsService.deleteNode = function(node) {
      var url = requisitionsService.internal.requisitionsUrl + '/' + node.foreignSource + '/nodes/' + node.foreignId;
      var deferred = $q.defer();
      $log.debug('deleteNode: deleting node ' + node.nodeLabel + ' from requisition ' + node.foreignSource);
      $http.delete(url)
      .success(function(data) {
        $log.debug('deleteNode: deleted node ' + node.nodeLabel + ' on requisition ' + node.foreignSource);
        deferred.resolve(data);
      }).error(function(data, status) {
        $log.error('deleteNode: DELETE ' + url + ' failed:', data, status);
        deferred.reject(status);
      });
      return deferred.promise;
    };

    /**
    * @description Request a foreign source definition from OpenNMS for a given requisition.
    *
    * @name RequisitionService:getForeignSourceDefinition
    * @ngdoc method
    * @param {string} The requisition's name (a.k.a. foreignSource), use 'default' for the default foreign source.
    * @methodOf RequisitionService
    * @returns {*} a handler function.
    */
    requisitionsService.getForeignSourceDefinition = function(foreignSource) {
      var url = requisitionsService.internal.foreignSourcesUrl + '/' + foreignSource;
      var deferred = $q.defer();
      $log.debug('getForeignSourceDefinition: getting definition for requisition ' + foreignSource);
      $http.get(url)
      .success(function(data) {
        $log.debug('getForeignSourceDefinition: got definition for requisition ' + foreignSource);
        deferred.resolve(data);
      })
      .error(function(data, status) {
        $log.error('getForeignSourceDefinition: GET ' + url + ' failed:', data, status);
        deferred.reject(status);
      });
      return deferred.promise;
    };

    /**
    * @description Updates the foreign source definition on the OpenNMS server for a given requisition.
    * The foreign source definition contains the set of policies and detectors, as well as the scan frequency.
    *
    * @name RequisitionService:saveForeignSourceDefinition
    * @ngdoc method
    * @methodOf RequisitionService
    * @param {Object} The requisition foreign source Object
    * @returns {*} a handler function.
    */
    requisitionsService.saveForeignSourceDefinition = function(foreignSourceDef) {
      var url = requisitionsService.internal.foreignSourcesUrl;
      var deferred = $q.defer();
      $log.debug('saveForeignSourceDefinition: saving definition for requisition ' + foreignSourceDef['foreign-source']);
      $http.post(url, foreignSourceDef)
      .success(function(data) {
        $log.debug('saveForeignSourceDefinition: saved definition for requisition ' + foreignSourceDef['foreign-source']);
        deferred.resolve(data);
      }).error(function(data, status) {
        $log.error('saveForeignSourceDefinition: POST ' + url + ' failed:', data, status);
        deferred.reject(status);
      });
      return deferred.promise;
    };

    return requisitionsService;

  }]);

}());
