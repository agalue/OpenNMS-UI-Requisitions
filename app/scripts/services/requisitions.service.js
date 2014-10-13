/*global RequisitionsData:true,Requisition:true,RequisitionNode:true */

/**
* @author Alejandro Galue <agalue@opennms.org>
* @copyright 2014 The OpenNMS Group, Inc.
*/

// http://jsfiddle.net/zMjVp/

(function() {

  'use strict';

  angular.module('onms-requisitions')

  /**
  * @ngdoc service
  * @name RequisitionsService
  * @module onms-requisitions
  *
  * @requires $q Angular promise/deferred implementation
  * @requires $cacheFactory Angular cache management
  * @requires $http Angular service that facilitates communication with the remote HTTP servers
  * @requires $log Angular log facility
  *
  * @description The RequisitionsService provides all the required methods to access ReST API for the OpenNMS requisitions.
  *
  * It uses Angular's Cache service to store localy all the requisitions after retrieving them from the server the first time.
  * This helps in terms of performance and responsiveness of the UI. Only changes are pushed back to the server.
  *
  * Conflicts may accour if someone else is changing the requisitions at the same time.
  *
  * If the cache is not going to be used, the controllers are responsible for maintaining the state of the data.
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
    * @private
    * @name RequisitionsService:internal.getCachedRequisitionsData
    * @ngdoc method
    * @methodOf RequisitionsService
    * @returns {object} the internal cache
    */
    requisitionsService.internal.getCachedRequisitionsData = function() {
      return requisitionsService.internal.cache.get('requisitionsData');
    };

    /**
    * @description (Internal) Saves the requisitions data into internal cache
    *
    * @private
    * @name RequisitionsService:internal.setCachedRequisitionsData
    * @ngdoc method
    * @methodOf RequisitionsService
    * @param {object} requisitionsData The requisitions data
    */
    requisitionsService.internal.setCachedRequisitionsData = function(requisitionsData) {
      requisitionsService.internal.cache.put('requisitionsData', requisitionsData);
    };

    /**
    * @description Clears the internal cache.
    *
    * This forces the service to retrieve the data from the server on next request.
    *
    * @name RequisitionsService:internal.clearRequisitionsCache
    * @ngdoc method
    * @methodOf RequisitionsService
    */
    requisitionsService.clearRequisitionsCache = function() {
      requisitionsService.internal.cache.removeAll();
    };

    /**
    * @description (Internal) Merges an OpenNMS requisition into the requisitionsData object.
    *
    * This method is going to analyze the requisitions data obtained from the server.
    * It assumes the deployed nodes are added first and then the pending nodes.
    * The status of the requisition and the nodes depend on the source (deployed, defined).
    *
    * @private
    * @name RequisitionsService:internal.mergeRequisition
    * @ngdoc method
    * @methodOf RequisitionsService
    * @param {object} requisitionsData The Requisitions Data object.
    * @param {object} onmsRequisition The OpenNMS Requisition object.
    * @param {boolean} deployed true, if the requisition has been deployed.
    */
    // FIXME This method is expensive in terms of enlapsed time and resources used.
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
    * @private
    * @name RequisitionsService:internal.mergeData
    * @ngdoc method
    * @methodOf RequisitionsService
    * @param {array} results The OpenNMS requisitions obtained from the ReST API, [pending, deployed]
    * @returns {object} the requisitions data.
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
    * @private
    * @name RequisitionsService:internal.getCachedRequisition
    * @ngdoc method
    * @methodOf RequisitionsService
    * @param {string} foreignSource The requisition's name (a.k.a. foreign source)
    * @returns {object} the requisition object.
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
    * @private
    * @name RequisitionsService:internal.getCachedNode
    * @ngdoc method
    * @methodOf RequisitionsService
    * @param {string} foreignSource The requisition's name (a.k.a. foreign source)
    * @param {string} foreignId The foreign Id
    * @returns {object} the node object.
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
    * After retrieving the pending requisitions and the defined requisitions, the data
    * is going to be merged to reflect the current state for each requisition and each node.
    *
    * After merging the data, the cache is going to be updated.
    *
    * If the cache exist, the method is going to use it instead of retrieving the data from the OpenNMS server.
    *
    * @name RequisitionsService:getRequisitions
    * @ngdoc method
    * @methodOf RequisitionsService
    * @returns {object} a promise.
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
    * If the cache exist, the method is going to use it instead of retrieving the data from the OpenNMS server.
    *
    * @name RequisitionsService:getRequisition
    * @ngdoc method
    * @param {string} foreignSource The requisition's name (a.k.a. foreignSource)
    * @methodOf RequisitionsService
    * @returns {object} a promise.
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
    *
    * The controller must guarantee that the requisition exist.
    * If the requisition exist on the internal cache, the operation will be rejected.
    * The internal cache will be updated after the request is completed successfully if exist.
    *
    * @name RequisitionsService:synchronizeRequisition
    * @ngdoc method
    * @methodOf RequisitionsService
    * @param {string} foreignSource The requisition's name (a.k.a. foreign source)
    * @param {boolean} rescanExisting true, to scan existing nodes
    * @returns {object} a promise.
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
          r.lastImport = Date.now();
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
    *
    * The controller must guarantee that the foreignSource is unique (it doesn't exist on the server).
    * If the requisition exist on the internal cache, the operation will be rejected.
    * The internal cache will be updated after the request is completed successfully if exist.
    *
    * @name RequisitionsService:addRequisition
    * @ngdoc method
    * @methodOf RequisitionsService
    * @param {string} foreignSource The requisition's name (a.k.a. foreign source)
    * @returns {object} a promise.
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
    *
    * The controller must guarantee that the requisition contains no nodes.
    * If the cache is defined and the requisition is not there, the operation will be rejected.
    * If the requisition exist on the cache and it is not empty, the operation will be rejected.
    * The internal cache will be updated after the request is completed successfully if exist.
    *
    * @name RequisitionsService:deleteRequisition
    * @ngdoc method
    * @methodOf RequisitionsService
    * @param {string} foreignSource The requisition's name (a.k.a. foreign source)
    * @param {boolean} deployed true, if the requisition is deployed
    * @returns {object} a promise.
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
        $log.error('deleteRequisition: DELETE ' + url + ' failed:', error, status);
        deferred.reject('Cannot delete the requisition ' + foreignSource + '. HTTP ' + status + ' ' + error);
      });
      return deferred.promise;
    };

    /**
    * @description Request the removal of all from an existing requisition on the OpenNMS server.
    *
    * The controller must ensure that the requisition exist.
    * If the cache is defined and the requisition is not there, the operation will be rejected.
    * The internal cache will be updated after the request is completed successfully if exist.
    *
    * @name RequisitionsService:removeAllNodesFromRequisition
    * @ngdoc method
    * @methodOf RequisitionsService
    * @param {string} foreignSource The requisition's name (a.k.a. foreign source)
    * @returns {object} a promise.
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
          req.dateStamp = Date.now();
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
    * If the cache exist, the method is going to use it instead of retrieving the data from the OpenNMS server.
    *
    * @name RequisitionsService:getNode
    * @ngdoc method
    * @param {string} foreignSource The requisition's name (a.k.a. foreign source)
    * @param {string} foreignId The foreignId of the node
    * @methodOf RequisitionsService
    * @returns {object} a promise.
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
    *
    * The controller must ensure that the foreignId is unique within the requisition when adding a new node.
    * 
    * The internal cache will be updated after the request is completed successfully if exist,
    * depending if the save operation is related with the update of an existing node, or if it
    * is related with the creation of a new node.
    *
    * @name RequisitionsService:removeAllNodesFromRequisition
    * @ngdoc method
    * @methodOf RequisitionsService
    * @param {object} node The RequisitionNode Object
    * @returns {object} a promise.
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
          r.dateStamp = Date.now();
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
    *
    * The controller must guarantee that the node exist on the requisition.
    * The internal cache will be updated after the request is completed successfully if exist.
    *
    * @name RequisitionsService:deleteNode
    * @ngdoc method
    * @methodOf RequisitionsService
    * @param {object} node The RequisitionNode Object
    * @returns {object} a promise.
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
            r.dateStamp = Date.now();
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
    * @name RequisitionsService:getForeignSourceDefinition
    * @ngdoc method
    * @param {string} foreignSource The requisition's name (a.k.a. foreign source), use 'default' for the default foreign source.
    * @methodOf RequisitionsService
    * @returns {object} a promise.
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
    *
    * The foreign source definition contains the set of policies and detectors, as well as the scan frequency.
    *
    * @name RequisitionsService:saveForeignSourceDefinition
    * @ngdoc method
    * @methodOf RequisitionsService
    * @param {object} foreignSourceDef The requisition foreign source Object
    * @returns {object} a promise.
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

    /**
    * @description Gets the available detectors.
    *
    * The data return by the promise should be an array of objects.
    * Each object contains the name of the detector and the full class name.
    *
    * @name RequisitionsService:getAvailableDetectors
    * @ngdoc method
    * @methodOf RequisitionsService
    * @returns {object} a promise.
    */
    // FIXME Temporal solution until we have a valid ReST Service for this: GET /foreignSources/config/detectors
    requisitionsService.getAvailableDetectors = function() {
      var data = [
        { 'name': 'BGP_Session', 'class': 'org.opennms.netmgt.provision.detector.snmp.BgpSessionDetector' },
        { 'name': 'BSF', 'class': 'org.opennms.netmgt.provision.detector.bsf.BSFDetector' },
        { 'name': 'CITRIX', 'class': 'org.opennms.netmgt.provision.detector.simple.CitrixDetector' },
        { 'name': 'Cisco_IP_SLA', 'class': 'org.opennms.netmgt.provision.detector.snmp.CiscoIpSlaDetector' },
        { 'name': 'DHCP', 'class': 'org.opennms.protocols.dhcp.detector.DhcpDetector' },
        { 'name': 'DNS', 'class': 'org.opennms.netmgt.provision.detector.datagram.DnsDetector' },
        { 'name': 'Dell_OpenManageChassis', 'class': 'org.opennms.netmgt.provision.detector.snmp.OpenManageChassisDetector' },
        { 'name': 'DiskUsage', 'class': 'org.opennms.netmgt.provision.detector.snmp.DiskUsageDetector' },
        { 'name': 'DominoIIOP', 'class': 'org.opennms.netmgt.provision.detector.simple.DominoIIOPDetector' },
        { 'name': 'FTP', 'class': 'org.opennms.netmgt.provision.detector.simple.FtpDetector' },
        { 'name': 'GP', 'class': 'org.opennms.netmgt.provision.detector.generic.GpDetector' },
        { 'name': 'HOST-RESOURCES', 'class': 'org.opennms.netmgt.provision.detector.snmp.HostResourceSWRunDetector' },
        { 'name': 'HTTP', 'class': 'org.opennms.netmgt.provision.detector.simple.HttpDetector' },
        { 'name': 'HTTPS', 'class': 'org.opennms.netmgt.provision.detector.simple.HttpsDetector' },
        { 'name': 'ICMP', 'class': 'org.opennms.netmgt.provision.detector.icmp.IcmpDetector' },
        { 'name': 'IMAP', 'class': 'org.opennms.netmgt.provision.detector.simple.ImapDetector' },
        { 'name': 'JBoss', 'class': 'org.opennms.netmgt.provision.detector.jmx.JBossDetector' },
        { 'name': 'JDBC', 'class': 'org.opennms.netmgt.provision.detector.jdbc.JdbcDetector' },
        { 'name': 'JSR160', 'class': 'org.opennms.netmgt.provision.detector.jmx.Jsr160Detector' },
        { 'name': 'JdbcQueryDetector', 'class': 'org.opennms.netmgt.provision.detector.jdbc.JdbcQueryDetector' },
        { 'name': 'JdbcStoredProcedureDetector', 'class': 'org.opennms.netmgt.provision.detector.jdbc.JdbcStoredProcedureDetector' },
        { 'name': 'LDAP', 'class': 'org.opennms.netmgt.provision.detector.simple.LdapDetector' },
        { 'name': 'LDAPS', 'class': 'org.opennms.netmgt.provision.detector.simple.LdapsDetector' },
        { 'name': 'LOOP', 'class': 'org.opennms.netmgt.provision.detector.loop.LoopDetector' },
        { 'name': 'MSExchange', 'class': 'org.opennms.netmgt.provision.detector.msexchange.MSExchangeDetector' },
        { 'name': 'MX4J', 'class': 'org.opennms.netmgt.provision.detector.jmx.MX4JDetector' },
        { 'name': 'Memcached', 'class': 'org.opennms.netmgt.provision.detector.simple.MemcachedDetector' },
        { 'name': 'NOTES', 'class': 'org.opennms.netmgt.provision.detector.simple.NotesHttpDetector' },
        { 'name': 'NRPE', 'class': 'org.opennms.netmgt.provision.detector.simple.NrpeDetector' },
        { 'name': 'NSClient', 'class': 'org.opennms.protocols.nsclient.detector.NsclientDetector' },
        { 'name': 'NTP', 'class': 'org.opennms.netmgt.provision.detector.datagram.NtpDetector' },
        { 'name': 'OMSAStorage', 'class': 'org.opennms.netmgt.provision.detector.snmp.OmsaStorageDetector' },
        { 'name': 'PERC', 'class': 'org.opennms.netmgt.provision.detector.snmp.PercDetector' },
        { 'name': 'POP3', 'class': 'org.opennms.netmgt.provision.detector.simple.Pop3Detector' },
        { 'name': 'RadiusAuth', 'class': 'org.opennms.protocols.radius.detector.RadiusAuthDetector' },
        { 'name': 'SMB', 'class': 'org.opennms.netmgt.provision.detector.smb.SmbDetector' },
        { 'name': 'SMTP', 'class': 'org.opennms.netmgt.provision.detector.simple.SmtpDetector' },
        { 'name': 'SNMP', 'class': 'org.opennms.netmgt.provision.detector.snmp.SnmpDetector' },
        { 'name': 'SSH', 'class': 'org.opennms.netmgt.provision.detector.ssh.SshDetector' },
        { 'name': 'TCP', 'class': 'org.opennms.netmgt.provision.detector.simple.TcpDetector' },
        { 'name': 'TrivialTime', 'class': 'org.opennms.netmgt.provision.detector.simple.TrivialTimeDetector' },
        { 'name': 'WEB', 'class': 'org.opennms.netmgt.provision.detector.web.WebDetector' },
        { 'name': 'WMI', 'class': 'org.opennms.netmgt.provision.detector.wmi.WmiDetector' },
        { 'name': 'Win32Service', 'class': 'org.opennms.netmgt.provision.detector.snmp.Win32ServiceDetector' }
      ];

      var deferred = $q.defer();
      deferred.resolve(data);
      return deferred.promise;
    };

    /**
    * @description Gets the available policies.
    *
    * The data return by the promise should be an array of objects.
    * Each object contains the name of the policy and the full class name.
    *
    * @name RequisitionsService:getAvailablePolicies
    * @ngdoc method
    * @methodOf RequisitionsService
    * @returns {object} a promise.
    */
    // FIXME Temporal solution until we have a valid ReST Service for this: GET /foreignSources/config/policies
    requisitionsService.getAvailablePolicies = function() {
      var data = [
        {
          'name': 'Match IP Interface',
          'class': 'org.opennms.netmgt.provision.persist.policies.MatchingIpInterfacePolicy',
          'parameters': [
            {
              'key': 'action',
              'required': true,
              'options': [
                'DISABLE_COLLECTION',
                'DISABLE_SNMP_POLL',
                'DO_NOT_PERSIST',
                'ENABLE_COLLECTION',
                'ENABLE_SNMP_POLL',
                'MANAGE',
                'UNMANAGE'
              ]
            }, {
              'key': 'matchBehavior',
              'required': true,
              'options': [
                'ALL_PARAMETERS',
                'ANY_PARAMETER',
                'NO_PARAMETER'
              ]
            }, {
              'key': 'hostName',
              'required': false
            }, {
              'key': 'ipAddress',
              'required': false
            }
          ]
        }, {
          'name': 'Match SNMP Interface',
          'class': 'org.opennms.netmgt.provision.persist.policies.MatchingSnmpInterfacePolicy',
          'parameters': [
            {
              'key': 'action',
              'required': true,
              'options': [
                'DISABLE_COLLECTION',
                'DISABLE_POLLING',
                'DO_NOT_PERSIST',
                'ENABLE_COLLECTION',
                'ENABLE_POLLING'
              ],
            },{
              'key': 'matchBehavior',
              'required': true,
              'options': [
                'ALL_PARAMETERS',
                'ANY_PARAMETER',
                'NO_PARAMETER'
              ]
            }, {
              'key': 'ifAdminStatus',
              'required': false
            }, {
              'key': 'ifAlias',
              'required': false
            }, {
              'key': 'ifDescr',
              'required': false
            }, {
              'key': 'ifIndex',
              'required': false
            }, {
              'key': 'ifName',
              'required': false
            }, {
              'key': 'ifOperStatus',
              'required': false
            }, {
              'key': 'ifSpeed',
              'required': false
            }, {
              'key': 'ifType',
              'required': false
            }, {
              'key': 'physAddr',
              'required': false
            }
          ]
        }, {
          'name': 'Set Node Category',
          'class': 'org.opennms.netmgt.provision.persist.policies.NodeCategorySettingPolicy',
          'parameters': [
            {
              'key': 'matchBehavior',
              'required': true,
              'options': [
                'ALL_PARAMETERS',
                'ANY_PARAMETER',
                'NO_PARAMETER'
              ]
            }, {
              'key': 'category',
              'required': true
            }, {
              'key': 'foreignId',
              'required': false
            }, {
              'key': 'foreignSource',
              'required': false
            }, {
              'key': 'label',
              'required': false
            }, {
              'key': 'labelSource',
              'required': false
            }, {
              'key': 'netBiosDomain',
              'required': false
            }, {
              'key': 'netBiosName',
              'required': false
            }, {
              'key': 'operatingSystem',
              'required': false
            }, {
              'key': 'sysContact',
              'required': false
            }, {
              'key': 'sysDescription',
              'required': false
            }, {
              'key': 'sysLocation',
              'required': false
            }, {
              'key': 'sysName',
              'required': false
            }, {
              'key': 'sysObjectId',
              'required': false
            }, {
              'key': 'type',
              'required': false
            }
          ]
        }
      ];

      var deferred = $q.defer();
      deferred.resolve(data);
      return deferred.promise;
    };

    /**
    * @description Gets the available services.
    *
    * The data return by the promise should be an array of strings.
    * Each strings contains the name of the service.
    *
    * @example [ 'ICMP', 'SNMP' ]
    *
    * @name RequisitionsService:getAvailableServices
    * @ngdoc method
    * @methodOf RequisitionsService
    * @returns {object} a promise.
    */
    // FIXME Temporal solution until we have a valid ReST Service for this: GET /foreignSources/config/services
    requisitionsService.getAvailableServices = function() {
      var deferred = $q.defer();
      var data = [
        'DNS',
        'Dell-OpenManage',
        'FTP',
        'HP Insight Manager',
        'HTTP',
        'HTTP-8000',
        'HTTP-8080',
        'HTTPS',
        'HypericAgent',
        'HypericHQ',
        'ICMP',
        'IMAP',
        'LDAP',
        'MSExchange',
        'MySQL',
        'NRPE',
        'NRPE-NoSSL',
        'OpenNMS-JVM',
        'Oracle',
        'POP3',
        'Postgres',
        'Router',
        'SMTP',
        'SNMP',
        'SQLServer',
        'SSH',
        'StrafePing',
        'Telnet',
        'Windows-Task-Scheduler',
      ];
      deferred.resolve(data);
      return deferred.promise;
    };

    /**
    * @description Gets the available assets.
    *
    * The data return by the promise should be an array of strings.
    * Each string is a valid asset field.
    *
    * @example [ 'address1, 'city', 'zip' ]
    *
    * @name RequisitionsService:getAvailableAssets
    * @ngdoc method
    * @methodOf RequisitionsService
    * @returns {object} a promise.
    */
    // FIXME Temporal solution until we have a valid ReST Service for this: GET /foreignSources/config/assets
    requisitionsService.getAvailableAssets = function() {
      var deferred = $q.defer();
      var data = [
        'additionalhardware',
        'address1',
        'address2',
        'admin',
        'assetnumber',
        'autoenable',
        'building',
        'category',
        'circuitid',
        'city',
        'comment',
        'connection',
        'country',
        'cpu',
        'dateinstalled',
        'department',
        'description',
        'displaycategory',
        'division',
        'enable',
        'floor',
        'hdd1',
        'hdd2',
        'hdd3',
        'hdd4',
        'hdd5',
        'hdd6',
        'inputpower',
        'lastmodifieddate',
        'latitude',
        'lease',
        'leaseexpires',
        'longitude',
        'maintcontract',
        'maintcontractexpires',
        'managedobjectinstance',
        'managedobjecttype',
        'manufacturer',
        'modelnumber',
        'nodeid',
        'notifycategory',
        'numpowersupplies',
        'operatingsystem',
        'password',
        'pollercategory',
        'port',
        'rack',
        'rackunitheight',
        'ram',
        'region',
        'room',
        'serialnumber',
        'slot',
        'snmpcommunity',
        'state',
        'storagectrl',
        'supportphone',
        'thresholdcategory',
        'userlastmodified',
        'username',
        'vendor',
        'vendorassetnumber',
        'vendorfax',
        'vendorphone',
        'vmwaremanagedentitytype',
        'vmwaremanagedobjectid',
        'vmwaremanagementserver',
        'vmwarestate',
        'vmwaretopologyinfo',
        'zip'
      ];
      deferred.resolve(data);
      return deferred.promise;
    };

    /**
    * @description Gets the available categories.
    *
    * The data return by the promise should be an array of strings.
    * Each string is a valid category name.
    *
    * @example [ 'Production, 'Development', 'Testing' ]
    *
    * @name RequisitionsService:getAvailableCategories
    * @ngdoc method
    * @methodOf RequisitionsService
    * @returns {object} a promise.
    */
    // FIXME Temporal solution until we have a valid ReST Service for this: GET /foreignSources/config/categories
    requisitionsService.getAvailableCategories = function() {
      var deferred = $q.defer();
      var data = [
        'Development',
        'Production',
        'Routers',
        'Servers',
        'Switches',
        'Test'
      ];
      deferred.resolve(data);
      return deferred.promise;
    };

    return requisitionsService;
  }]);

}());
