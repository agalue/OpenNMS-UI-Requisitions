/*global Requisition:true, bootbox:true */

// Controller for the requisition page (add/edit the requisition)
// Author: Alejandro Galue <agalue@opennms.org>

(function() {

  'use strict';

  angular.module('onms-requisitions')

  .controller('RequisitionController', ['$scope', '$filter', '$routeParams', 'RequisitionsService', 'growl', function($scope, $filter, $routeParams, RequisitionsService, growl) {

    $scope.foreignSource = $routeParams.foreignSource;
    $scope.requisition = new Requisition({});
    $scope.filteredNodes = [];
    $scope.pageSize = 10;
    $scope.maxSize = 5;
    $scope.totalItems = 0;

    // Common error handling
    $scope.errorHandler = function(message) {
      growl.addErrorMessage(message, {ttl: 10000});
    };

    // Requests the synchronization/import of a requisition on the server
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

    // Deletes a node from the requisition on the server and refresh the local nodes list
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

    // Initialize the local requisition from the server
    $scope.initializeRequisition = function() {
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

    // Watch for filter changes in order to update the nodes list and updates the pagination control
    $scope.$watch('reqFilter', function() {
      $scope.currentPage = 1;
      $scope.filteredNodes = $filter('filter')($scope.requisition.nodes, $scope.reqFilter);
      $scope.totalItems = $scope.filteredNodes.length;
      $scope.numPages = Math.ceil($scope.totalItems / $scope.pageSize);
    });

    // Initializes the requisition page
    if ($scope.foreignSource) {
      $scope.initializeRequisition();
    }

  }]);

}());
