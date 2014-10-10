/*global Requisition:true, bootbox:true */

/**
* @author Alejandro Galue <agalue@opennms.org>
* @copyright 2014 The OpenNMS Group, Inc.
*/

(function() {

  'use strict';

  angular.module('onms-requisitions')

  /**
  * @ngdoc controller
  * @name RequisitionController
  * @module onms-requisitions
  *
  * @description The controller for manage a single requisition (add/edit)
  *
  * @requires $scope Angular local scope
  * @requires $filter Angular requisitions list filter
  * @requires $window Document window
  * @requires $routeParams Angular route parameters
  * @requires RequisitionsService The requisitions service
  * @requires growl The growl plugin for instant notifications
  */
  .controller('RequisitionController', ['$scope', '$filter', '$window', '$routeParams', 'RequisitionsService', 'growl', function($scope, $filter, $window, $routeParams, RequisitionsService, growl) {

    /**
     * @description The foreign source (a.k.a the name of the requisition).
     * The default value is obtained from the $routeParams.
     *
     * @ngdoc property
     * @name RequisitionController#foreignSource
     * @propertyOf RequisitionController
     * @returns {string} The foreign source
     */
    $scope.foreignSource = $routeParams.foreignSource;

    /**
     * @description The requisition object
     * @ngdoc property
     * @name RequisitionController#requisition
     * @propertyOf RequisitionController
     * @returns {object} The requisition object
     */
    $scope.requisition = new Requisition({});

    /**
     * @description The filtered list of nodes
     * @ngdoc property
     * @name RequisitionController#filteredNodes
     * @propertyOf RequisitionController
     * @returns {array} The filtered array
     */
    $scope.filteredNodes = [];

    /**
     * @description The amount of items per page for pagination (defaults to 10)
     * @ngdoc property
     * @name RequisitionController#pageSize
     * @propertyOf RequisitionController
     * @returns {integer} The page size
     */
    $scope.pageSize = 10;

    /**
     * @description The maximum size of pages for pagination (defaults to 5)
     * @ngdoc property
     * @name RequisitionController#maxSize
     * @propertyOf RequisitionController
     * @returns {integer} The maximum size
     */
    $scope.maxSize = 5;

    /**
     * @description The total amount of items for pagination (defaults to 0)
     * @ngdoc property
     * @name RequisitionController#maxSize
     * @propertyOf RequisitionController
     * @returns {integer} The total items
     */
    $scope.totalItems = 0;

    /**
    * @description Goes back to requisitions list (navigation)
    *
    * @name RequisitionController:goBack
    * @ngdoc method
    * @methodOf RequisitionController
    */
    // FIXME Should be called getTop to be consistent with the rest of the controllers
    $scope.goBack = function() {
      $window.location.href = '#/requisitions';
    };

    /**
    * @description Goes to the edition page for the foreign source definition of the requisition (navigation)
    *
    * @name RequisitionController:editForeignSource
    * @ngdoc method
    * @methodOf RequisitionController
    */
    $scope.editForeignSource = function() {
      $window.location.href = '#/requisitions/' + $scope.foreignSource + '/foreignSource';
    };

    /**
    * @description Shows an error to the user
    *
    * @name RequisitionController:errorHandler
    * @ngdoc method
    * @methodOf RequisitionController
    * @param {string} message The error message
    */
    $scope.errorHandler = function(message) {
      growl.addErrorMessage(message, {ttl: 10000});
    };

    /**
    * @description Requests the synchronization/import of a requisition on the server
    *
    * @name RequisitionController:synchronize
    * @ngdoc method
    * @methodOf RequisitionController
    */
    // FIXME bootbox ?
    $scope.synchronize = function() {
      var foreignSource = $scope.foreignSource;
      var doSynchronize = function(foreignSource, rescanExisting) {
        RequisitionsService.synchronizeRequisition(foreignSource, rescanExisting).then(
          function() { // success
            growl.addSuccessMessage('The import operation has been started for ' + foreignSource + ' (rescanExisting? ' + rescanExisting + ')');
          },
          $scope.errorHandler
        );
      };
      bootbox.dialog({
        message: 'Do you want to rescan existing nodes ?',
        title: 'Synchronize Requisition ' + foreignSource,
        buttons: {
          success: {
            label: 'Yes',
            className: 'btn-success',
            callback: function() {
              doSynchronize(foreignSource, true);
            }
          },
          danger: {
            label: 'No',
            className: 'btn-danger',
            callback: function() {
              doSynchronize(foreignSource, false);
            }
          },
          main: {
            label: 'Cancel',
            className: 'btn-default'
          }
        }
      });
    };

    /**
    * @description Goes to the page for adding a new node to the requisition (navigation)
    *
    * @name RequisitionController:addNode
    * @ngdoc method
    * @methodOf RequisitionController
    */
    $scope.addNode = function() {
      $window.location.href = '#/requisitions/' + $scope.foreignSource + '/nodes/__new__';
    };

    /**
    * @description Goes to the page for editing an existing node of the requisition (navigation)
    * @description
    *
    * @name RequisitionController:editNode
    * @ngdoc method
    * @methodOf RequisitionController
    * @param {object} The node's object to edit
    */
    $scope.editNode = function(node) {
      $window.location.href = '#/requisitions/' + $scope.foreignSource + '/nodes/' + node.foreignId;
    };

    /**
    * @description Deletes a node from the requisition on the server and refresh the local nodes list
    *
    * @name RequisitionController:deleteNode
    * @ngdoc method
    * @methodOf RequisitionController
    * @param {object} The node's object to delete
    */
    $scope.deleteNode = function(node) {
      bootbox.confirm('Are you sure you want to remove the node ' + node.nodeLabel + '?', function(ok) {
        if (ok) {
          RequisitionsService.deleteNode(node).then(
            function() { // success
              growl.addSuccessMessage('The node ' + node.nodeLabel + ' has been deleted.');
            },
            $scope.errorHandler
          );
        }
      });
    };

    /**
    * @description Initializes the local requisition from the server
    *
    * @name RequisitionController:initialize
    * @ngdoc method
    * @methodOf RequisitionController
    */
    $scope.initialize = function() {
      growl.addInfoMessage('Retrieving requisition ' + $scope.foreignSource + '...');
      RequisitionsService.getRequisition($scope.foreignSource).then(
        function(requisition) { // success
          $scope.currentPage = 1;
          $scope.requisition = requisition;
          $scope.totalItems = requisition.nodes.length;
          $scope.numPages = Math.ceil($scope.totalItems / $scope.pageSize);
          $scope.filteredNodes = requisition.nodes;
        },
        $scope.errorHandler
      );
    };

    /**
    * @description Watch for filter changes in order to update the nodes list and updates the pagination control
    *
    * @name RequisitionController:regFilter
    * @ngdoc event
    * @methodOf RequisitionController
    */
    $scope.$watch('reqFilter', function() {
      $scope.currentPage = 1;
      $scope.filteredNodes = $filter('filter')($scope.requisition.nodes, $scope.reqFilter);
      $scope.totalItems = $scope.filteredNodes.length;
      $scope.numPages = Math.ceil($scope.totalItems / $scope.pageSize);
    });

    // Initializes the requisition page
    if ($scope.foreignSource) {
      $scope.initialize();
    }

  }]);

}());
