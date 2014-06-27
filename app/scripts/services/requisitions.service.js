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
  .factory('RequisitionsService', ['$q', '$cacheFactory', '$http', '$log', function($q, $cacheFactory, $http, $log) {

    $log.debug('Initializing RequisitionsService');

    var requisitionsService = {};
    requisitionsService.internal = {};

    requisitionsService.internal.requisitionsUrl   = '/opennms/rest/requisitions';
    requisitionsService.internal.foreignSourcesUrl = '/opennms/rest/foreignSources';
    requisitionsService.internal.cache = $cacheFactory('RequisitionsService');

    /**
    * @description (Internal) Gets the requisitions data from the internal cache
    *
    * @name RequisitionService:internal.getCachedRequisitionsData
    * @ngdoc method
    * @methodOf RequisitionService
    * @returns {Object} the internal cache
    * @private
    */
    requisitionsService.internal.getCachedRequisitionsData = function() {
      return requisitionsService.internal.cache.get('requisitionsData');
    };

    /**
    * @description (Internal) Saves the requisitions data into internal cache
    *
    * @name RequisitionService:internal.setCachedRequisitionsData
    * @ngdoc method
    * @methodOf RequisitionService
    * @param {Object} The requisitions data
    * @private
    */
    requisitionsService.internal.setCachedRequisitionsData = function(requisitionsData) {
      requisitionsService.internal.cache.put('requisitionsData', requisitionsData);
    };

    /**
    * @description Clears the internal cache
    *
    * @name RequisitionService:internal.clearRequisitionsCache
    * @ngdoc method
    * @methodOf RequisitionService
    */
    requisitionsService.clearRequisitionsCache = function() {
      requisitionsService.internal.cache.removeAll();
    };

    /**
    * @description (Internal) Merges an OpenNMS requisition into the requisitionsData object.
    * Assumes the deployed nodes are going to be added first and then the pending nodes.
    *
    * @name RequisitionService:internal.mergeRequisition
    * @ngdoc method
    * @methodOf RequisitionService
    * @param {Object} The Requisitions Data object.
    * @param {Object} The OpenNMS Requisition object.
    * @param {boolean} true, if the requisition has been deployed.
    * @private
    */
    requisitionsService.internal.mergeRequisition = function(requisitionsData, onmsRequisition, deployed) {
      var requisition = new Requisition(onmsRequisition, deployed);
      requisitionsData.status[deployed ? 'deployed' : 'pending']++;
      var existingReqIndex = requisitionsData.indexOf(requisition.foreignSource);
      if (existingReqIndex < 0) {
        $log.debug('mergeRequisition: adding ' + (deployed ? 'deployed' : 'pending') + ' requisition ' + requisition.foreignSource + '.');
        requisitionsData.requisitions.push(requisition);
      } else {
        // Because the deployed requisitions are processed first, the existing requisition is considered a deployed requisition.
        var existingReq = requisitionsData.requisitions[existingReqIndex];
        existingReq.deployed = false; // temporary set to false to compare the requisitions.
        if (angular.equals(existingReq, requisition)) { // the requisition was not modified.
          existingReq.deployed = true; // restoring the deployed flag.
          $log.debug('mergeRequisition: the requisition ' + requisition.foreignSource + ' has not been modified.');
        } else { // the requisition was modified
          $log.debug('mergeRequisition: the requisition ' + requisition.foreignSource + ' has been modified.');
          existingReq.nodesDefined = requisition.nodes.length; // updating defined nodes (pending nodes)
          for (var idx = 0; idx < requisition.nodes.length; idx++) {
            var currentNode = requisition.nodes[idx];
            var existingNodeIndex = existingReq.indexOf(currentNode.foreignId);
            if (existingNodeIndex < 0) { // new node
              $log.debug('mergeRequisition: the foreignId ' + currentNode.foreignId + ' is new, adding it to ' + requisition.foreignSource + '.');
              existingReq.nodes.push(currentNode);
              if (currentNode.deployed) { existingReq.nodesInDatabase++; } else { existingReq.nodesDefined++; }
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
        if (existingReq.nodesInDatabase === existingReq.nodesDefined) {
          existingReq.dsployed = true;
        }
      }
    };

    /**
    * @description (Internal) Merges the deployed and pending requisitions obtained from OpenNMS into a single object.
    *
    * @name RequisitionService:internal.mergeData
    * @ngdoc method
    * @methodOf RequisitionService
    * @param {Array} The OpenNMS requisitions obtained from the ReST API, [pending, deployed]
    * @returns {Object} the requisitions data.
    * @private
    */
    requisitionsService.internal.mergeRequisitions = function(results) {
      var pendingRequisitions  = results[0].data;
      var deployedRequisitions = results[1].data;
      var requisitionsData = new RequisitionsData();

      $log.debug('mergeRequisitions: processing deployed requisitions');
      angular.forEach(deployedRequisitions['model-import'], function(r) {
        requisitionsService.internal.mergeRequisition(requisitionsData, r, true);
      });

      $log.debug('mergeRequisitions: processing pending requisitions');
      angular.forEach(pendingRequisitions['model-import'], function(r) {
        requisitionsService.internal.mergeRequisition(requisitionsData, r, false);
      });

      requisitionsService.internal.setCachedRequisitionsData(requisitionsData);
      return requisitionsData;
    };

    /**
    * @description (Internal) Gets a specific requisition object from the cache.
    *
    * @name RequisitionService:internal.getCachedRequisition
    * @ngdoc method
    * @methodOf RequisitionService
    * @param {string} The foreign source
    * @returns {Object} the requisition object.
    * @private
    */
    requisitionsService.internal.getCachedRequisition = function(foreignSource) {
      var requisitionsData = requisitionsService.internal.getCachedRequisitionsData();
      if (requisitionsData == null) {
        return null;
      }
      var index = requisitionsData.indexOf(foreignSource);
      if (index < 0) {
        return null;
      }
      return requisitionsData.requisitions[index];
    };

    /**
    * @description (Internal) Gets a specific node object from the cache.
    *
    * @name RequisitionService:internal.getCachedNode
    * @ngdoc method
    * @methodOf RequisitionService
    * @param {string} The foreign source
    * @param {string} The foreign Id
    * @returns {Object} the node object.
    * @private
    */
    requisitionsService.internal.getCachedNode = function(foreignSource, foreignId) {
      var requisition = requisitionsService.internal.getCachedRequisition(foreignSource);
      if (requisition == null) {
        return null;
      }
      var index = requisition.indexOf(foreignId);
      if (index < 0) {
        return null;
      }
      return requisition.nodes[index];
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
      var deferredResults = $q.defer();

      var requisitionsData = requisitionsService.internal.getCachedRequisitionsData();
      if (requisitionsData != null) {
        $log.debug('getRequisitions: returning a cached copy of the requisitions data');
        deferredResults.resolve(requisitionsData);
        return deferredResults.promise;
      }

      var pendingUrl  = requisitionsService.internal.requisitionsUrl;
      var deployedUrl = requisitionsService.internal.requisitionsUrl + '/deployed';

      $log.debug('getRequisitions: retrieving pending and deployed requisitions.');
      var deferredPending  = $http.get(pendingUrl);
      var deferredDeployed = $http.get(deployedUrl);

      $log.debug('getRequisitions: merging pending and deployed requisitions.');
      $q.all([ deferredPending, deferredDeployed ])
      .then(function(results) {
        var requisitionsData = requisitionsService.internal.mergeRequisitions(results);
        $log.debug('getRequisitions: merged pending and deployed requisitions.');
        deferredResults.resolve(requisitionsData);
      }, function(message) {
        var msg = 'Cannot merge the requisitions. ' + message;
        $log.error('getRequisitions: ' + msg);
        deferredResults.reject(msg);
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
      var deferred = $q.defer();

      var requisition = requisitionsService.internal.getCachedRequisition(foreignSource);
      if (requisition != null) {
        $log.debug('getRequisition: returning a cached copy of ' + foreignSource);
        deferred.resolve(requisition);
        return deferred.promise;
      }

      var url  = requisitionsService.internal.requisitionsUrl + '/' + foreignSource;
      $log.debug('getRequisition: getting requisition ' + foreignSource);
      $http.get(url)
      .success(function(data) {
        var requisition = new Requisition(data);
        $log.debug('getRequisition: got requisition ' + foreignSource);
        deferred.resolve(requisition);
      })
      .error(function(error, status) {
        $log.error('getRequisition: GET ' + url + ' failed:', error, status);
        deferred.reject('Cannot retrieve the requisition ' + foreignSource + '. HTTP ' + status + ' ' + error);
      });
      return deferred.promise;
    };

    /**
    * @description Request the synchronization/import of a requisition on the OpenNMS server.
    * The controller is responsible for update the status of the requisition object,
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
      var deferred = $q.defer();

      var requisitionsData = requisitionsService.internal.getCachedRequisitionsData();
      if (requisitionsData != null) {
        var reqIdx = requisitionsData.indexOf(foreignSource);
        if (reqIdx < 0) {
          deferred.reject('The foreignSource ' + foreignSource + ' does not exist.');
          return deferred.promise;
        }
      }

      var url = requisitionsService.internal.requisitionsUrl + '/' + foreignSource + '/import';
      $log.debug('synchronizeRequisition: synchronizing requisition ' + foreignSource);
      $http({ method: 'PUT', url: url, params: { rescanExisting: rescanExisting ? 'true' : 'false' }})
      .success(function(data) {
        $log.debug('synchronizeRequisition: synchronized requisition ' + foreignSource);
        var r = requisitionsService.internal.getCachedRequisition(foreignSource);
        if (r != null) {
          $log.debug('synchronizeRequisition: updating deployed status of requisition ' + foreignSource);
          r.setDeployed(true);
        }
        deferred.resolve(data);
      })
      .error(function(error, status) {
        $log.error('synchronizeRequisition: PUT ' + url + ' failed:', error, status);
        deferred.reject('Cannot synchronize the requisition ' + foreignSource + '. HTTP ' + status + ' ' + error);
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
      var deferred = $q.defer();

      var req = requisitionsService.internal.getCachedRequisition(foreignSource);
      if (req != null) {
        deferred.reject('Invalid foreignSource ' + foreignSource + ', it already exist.');
        return deferred.promise;
      }

      var emptyReq = { 'foreign-source': foreignSource, node: [] };
      var url = requisitionsService.internal.requisitionsUrl;
      $log.debug('addRequisition: adding requisition ' + foreignSource);
      $http.post(url, emptyReq)
      .success(function() {
        var requisition = new Requisition(emptyReq, false);
        $log.debug('addRequisition: added requisition ' + requisition.foreignSource);
        var data = requisitionsService.internal.getCachedRequisitionsData();
        if (data != null) {
          $log.debug('addRequisition: pushing requisition ' + foreignSource + ' into the internal cache');
          data.requisitions.push(requisition);
        }
        deferred.resolve(requisition);
      }).error(function(error, status) {
        $log.error('addRequisition: POST ' + url + ' failed:', error, status);
        deferred.reject('Cannot add the requisition ' + foreignSource + '. HTTP ' + status + ' ' + error);
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

      var requisitionsData = requisitionsService.internal.getCachedRequisitionsData();
      if (requisitionsData != null) {
        var reqIdx = requisitionsData.indexOf(foreignSource);
        if (reqIdx < 0) {
          deferred.reject('The foreignSource ' + foreignSource + ' does not exist.');
          return deferred.promise;
        }
        var req = requisitionsData.requisitions[reqIdx];
        if (req.nodesInDatabase > 0) {
          deferred.reject('The foreignSource ' + foreignSource + ' contains ' + req.nodesInDatabase + ' nodes on the database, it cannot be deleted.');
          return deferred.promise;
        }
      }

      var url = requisitionsService.internal.requisitionsUrl + (deployed ? '/deployed/' : '/') + foreignSource;
      $log.debug('deleteRequisition: deleting ' + (deployed ? 'deployed' : 'pending') + ' requisition ' + foreignSource);
      $http.delete(url)
      .success(function(data) {
        $log.debug('deleteRequisition: deleted ' + (deployed ? 'deployed' : 'pending')+ ' requisition ' + foreignSource);
        if (requisitionsData != null) {
          $log.debug('deleteRequisition: removing requisition ' + foreignSource + ' from the internal cache');
          requisitionsData.requisitions.splice(reqIdx, 1);
        }
        deferred.resolve(data);
      }).error(function(error, status) {
        $log.error('addRequisition: DELETE ' + url + ' failed:', data, error);
        deferred.reject('Cannot delete the requisition ' + foreignSource + '. HTTP ' + status + ' ' + error);
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

      var requisitionsData = requisitionsService.internal.getCachedRequisitionsData();
      if (requisitionsData != null) {
        var reqIdx = requisitionsData.indexOf(foreignSource);
        if (reqIdx < 0) {
          deferred.reject('The foreignSource ' + foreignSource + ' does not exist.');
          return deferred.promise;
        }
      }

      var requisition = {'foreign-source': foreignSource, node: []};
      var url = requisitionsService.internal.requisitionsUrl;
      $log.debug('removeAllNodesFromRequisition: removing nodes from requisition ' + foreignSource);
      $http.post(url, requisition)
      .success(function(data) {
        $log.debug('removeAllNodesFromRequisition: removed nodes requisition ' + foreignSource);
        var req = requisitionsService.internal.getCachedRequisition(foreignSource);
        if (req != null) {
          $log.debug('removeAllNodesFromRequisition: updating requisition ' + foreignSource + ' on the internal cache');
          req.nodes = [];
          req.nodesDefined = 0;
        }
        deferred.resolve(data);
      }).error(function(error, status) {
        $log.error('removeAllNodesFromRequisition: POST ' + url + ' failed:', error, status);
        deferred.reject('Cannot remove all nodes from requisition ' + foreignSource + '. HTTP ' + status + ' ' + error);
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
      var deferred = $q.defer();

      var node = requisitionsService.internal.getCachedNode(foreignSource, foreignId);
      if (node != null) {
        $log.debug('getNode: returning a cached copy of ' + foreignId + '@' + foreignSource);
        deferred.resolve(node);
        return deferred.promise;
      }

      var url  = requisitionsService.internal.requisitionsUrl + '/' + foreignSource + '/nodes/' + foreignId;
      $log.debug('getNode: getting node ' + foreignId + '@' + foreignSource);
      $http.get(url)
      .success(function(data) {
        var node = new RequisitionNode(foreignSource, data);
        $log.debug('getNode: got node ' + foreignId + '@' + foreignSource);
        deferred.resolve(node);
      })
      .error(function(error, status) {
        $log.error('getNode: GET ' + url + ' failed:', error, status);
        deferred.reject('Cannot retrieve node ' + foreignId + ' from requisition ' + foreignSource + '. HTTP ' + status + ' ' + error);
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
        $log.debug('saveNode: saved node ' + node.nodeLabel + ' on requisition ' + node.foreignSource);
        var r = requisitionsService.internal.getCachedRequisition(node.foreignSource);
        if (r != null && r.indexOf(node.foreignId) < 0) {
          $log.debug('saveNode: adding new node ' + node.foreignId + '@' + node.foreignSource + ' into the internal cache');
          r.nodes.push(node);
          r.nodesDefined++;
          r.deployed = false;
        }
        node.deployed = false;
        deferred.resolve(data);
      }).error(function(error, status) {
        $log.error('saveNode: POST ' + url + ' failed:', error, status);
        deferred.reject('Cannot save node ' + node.foreignId + ' on requisition ' + node.foreignSource + '. HTTP ' + status + ' ' + error);
      });
      return deferred.promise;
    };

    /**
    * @description Request the removal of a node from an existing requisition on the OpenNMS server.
    * The controller must ensure that the requisition exist, and the node is part of the requisition.
    * The controller is responsible for update the status of the requisition object,
    * after a successful removal.
    *
    * @name RequisitionService:deleteNode
    * @ngdoc method
    * @methodOf RequisitionService
    * @param {Object} The RequisitionNode Object
    * @returns {*} a handler function.
    */
    requisitionsService.deleteNode = function(node) {
      var deferred = $q.defer();
      var url = requisitionsService.internal.requisitionsUrl + '/' + node.foreignSource + '/nodes/' + node.foreignId;
      $log.debug('deleteNode: deleting node ' + node.nodeLabel + ' from requisition ' + node.foreignSource);
      $http.delete(url)
      .success(function(data) {
        $log.debug('deleteNode: deleted node ' + node.nodeLabel + ' on requisition ' + node.foreignSource);
        var r = requisitionsService.internal.getCachedRequisition(node.foreignSource);
        if (r != null) {
          var idx = r.indexOf(node.foreignId);
          if (idx > -1) {
            $log.debug('deleteNode: removing node ' + node.foreignId + '@' + node.foreignSource + ' from the internal cache');
            r.nodes.splice(idx, 1);
            r.nodesDefined--;
            r.deployed = false;
          }
        }
        deferred.resolve(data);
      }).error(function(error, status) {
        $log.error('deleteNode: DELETE ' + url + ' failed:', error, status);
        deferred.reject('Cannot delete node ' + node.foreignId + ' from requisition ' + node.foreignSource + '. HTTP ' + status + ' ' + error);
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
      var deferred = $q.defer();
      var url = requisitionsService.internal.foreignSourcesUrl + '/' + foreignSource;
      $log.debug('getForeignSourceDefinition: getting definition for requisition ' + foreignSource);
      $http.get(url)
      .success(function(data) {
        $log.debug('getForeignSourceDefinition: got definition for requisition ' + foreignSource);
        deferred.resolve(data);
      })
      .error(function(error, status) {
        $log.error('getForeignSourceDefinition: GET ' + url + ' failed:', error, status);
        deferred.reject('Cannot retrieve foreign source definition (detectors and policies) for requisition ' + foreignSource + '. HTTP ' + status + ' ' + error);
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
      var deferred = $q.defer();
      var foreignSource = foreignSourceDef['foreign-source'];
      var url = requisitionsService.internal.foreignSourcesUrl;
      $log.debug('saveForeignSourceDefinition: saving definition for requisition ' + foreignSource);
      $http.post(url, foreignSourceDef)
      .success(function(data) {
        $log.debug('saveForeignSourceDefinition: saved definition for requisition ' + foreignSource);
        deferred.resolve(data);
      }).error(function(error, status) {
        $log.error('saveForeignSourceDefinition: POST ' + url + ' failed:', error, status);
        deferred.reject('Cannot save foreign source definition (detectors and policies) for requisition ' + foreignSource + '. HTTP ' + status + ' ' + error);
      });
      return deferred.promise;
    };

    return requisitionsService;

  }]);

}());
