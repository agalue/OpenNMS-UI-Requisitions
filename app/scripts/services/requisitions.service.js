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

    var requisitionsService = new Object();
    requisitionsService.internal = new Object();

    requisitionsService.internal.requisitionsUrl = "/opennms/rest/requisitions";

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
    requisitionsService.internal.mergeData = function(results) {
      var pendingRequisitions  = results[0].data;
      var deployedRequisitions = results[1].data;
      var combinedData = {
        status: {
          deployed: 0,
          pending: 0
        },
        requisitions: {}
      };

      // Assumes the deployed nodes are going to be added first and then the pending nodes.
      var addRequisition = function(req, deployed) {
        var requisition = new Requisition(req, deployed);
        combinedData['status'][deployed ? 'deployed' : 'pending']++;
        var existing = combinedData.requisitions[requisition.foreignSource];
        if (existing == null) {
          $log.debug('Adding ' + (deployed ? 'deployed' : 'pending') + ' requisition ' + requisition.foreignSource + '.');
          combinedData.requisitions[requisition.foreignSource] = requisition;
        } else {
          existing.deployed = false; // temporary set to false to compare the requisitions.
          if (angular.equals(existing, requisition)) { // the requisition was not modified.
            existing.deployed = true; // restoring the deployed flag.
            $log.debug('The foreignSource ' + requisition.foreignSource + ' has not been modified.');            
          } else { // the requisition was modified
            $log.debug('The foreignSource ' + requisition.foreignSource + ' has been modified.');
            for (var foreignId in requisition.nodes) {
              if (existing.nodes[foreignId] == null) { // new node
                $log.debug('The foreignId ' + foreignId + ' is new, adding it to ' + requisition.foreignSource + '.');
                existing.nodes[foreignId] = requisition.nodes[foreignId];
              } else { // modified node ?
                existing.nodes[foreignId].deployed = false; // temporary set to false to compare the nodes.
                if (angular.equals(existing.nodes[foreignId], requisition.nodes[foreignId])) { // ummodified node.
                  $log.debug('The foreignId ' + foreignId + ' has not been modified on ' + requisition.foreignSource + '.');
                  existing.nodes[foreignId].deployed = true; // restoring the deployed flag.
                } else { // modified node
                  $log.debug('The foreignId ' + foreignId + ' was modified, replacing it into ' + requisition.foreignSource + '.');
                  existing.nodes[foreignId] = requisition.nodes[foreignId];
                }
              }
            }
          }
        }
      };

      $log.debug('Processing deployed requisitions');
      angular.forEach(deployedRequisitions['model-import'], function(r) {
        addRequisition(r, true);
      });

      $log.debug('Processing pending requisitions');
      angular.forEach(pendingRequisitions['model-import'], function(r) {
        addRequisition(r, false);
      });

      return combinedData;
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
      var deployedUrl = requisitionsService.internal.requisitionsUrl + "/deployed";

      $log.debug('getRequisitions: retrieving pending and deployed requisitions.');
      var deferredPending  = $http.get(pendingUrl);
      var deferredDeployed = $http.get(deployedUrl);

      $log.debug('getRequisitions: combining pending and deployed requisitions.');
      var deferredResults = $q.defer();
      $q.all([ deferredPending, deferredDeployed ])
      .then(function(results) {
        var combinedData = requisitionsService.internal.mergeData(results);
        $log.debug('getRequisitions: combined requisitions');
        deferredResults.resolve(combinedData); 
      }, function(message) {
        var status = 'cannot merge the requisitions. ' + message;
        $log.error('getRequisitions: ' + status);
        defferedResults.reject(status);
      });

      return deferredResults.promise;
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
    * @returns {*} a handler function.
    */
    requisitionsService.synchronizeRequisition = function(foreignSource) {
      var url = requisitionsService.internal.requisitionsUrl + '/' + foreignSource + '/import';
      var deferred = $q.defer();
      $log.debug('synchronizeRequisition: synchronizing requisition ' + foreignSource);
      $http.put(url)
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
    * @param {string} The requisition's name (a.k.a. foreignSource)
    * @returns {*} a handler function.
    */
    requisitionsService.deleteRequisition = function(foreignSource) {
      var deferred = $q.defer();
      var url = requisitionsService.internal.requisitionsUrl + '/' + foreignSource;
      $log.debug('deleteRequisition: deleting requisition ' + foreignSource);
      $http.delete(url)
      .success(function(data) {
        $log.debug('deleteRequisition: deleted requisition ' + foreignSource);
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

    return requisitionsService;

  }]);

}());
