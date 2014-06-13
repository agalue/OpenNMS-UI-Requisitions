/*global Requisition:true */

// Controller for the requisition page (add/edit the requisition)
// Author: Alejandro Galue <agalue@opennms.org>

(function() {

  'use strict';

  angular.module('onms-requisitions')

  .controller('RequisitionController', ['$scope', '$filter', '$routeParams', 'RequisitionsService', 'growl', function($scope, $filter, $routeParams, RequisitionsService, growl) {

    $scope.foreignSource = $routeParams.foreignSource;
    $scope.requisition = new Requisition({});
    $scope.filteredNodes = {};
    $scope.pageSize = 10;
    $scope.maxSize = 5;
    $scope.totalItems = 0;

    // Deletes a node from the requisition on the server and refresh the local nodes list
    $scope.deleteNode = function(node) {
      RequisitionsService.deleteNode(node).then(
        function() { // success
          $scope.refresh(); // FIXME
          growl.addSuccessMessage('The node ' + node.nodeLabel + 'has been deleted.');
        },
        function() { // error
          growl.addErrorMessage('Cannot delete the node' + node.nodeLabel);
        }
      );
    };

    // Refresh the local requisition from the server
    $scope.refresh = function() {
      growl.addInfoMessage('Retrieving requisition ' + $scope.foreignSource + '...');
      RequisitionsService.getRequisition($scope.foreignSource).then(
        function(requisition) { // success
          $scope.currentPage = 1;
          $scope.requisition = requisition;
          $scope.totalItems = requisition.nodesCount();
          $scope.numPages = Math.ceil($scope.totalItems / $scope.pageSize);
          $scope.filteredNodes = requisition.nodes;
        },
        function() { // error
          growl.addErrorMessage('Cannot retrieve the requisition ' + $scope.foreignSource);
        }
      );
    };

    // Watch for filter changes in order to update the nodes list and updates the pagination control
    $scope.$watch('reqFilter', function() {
      $scope.currentPage = 1;
      $scope.filteredNodes = $filter('filter')($scope.requisition.nodes, $scope.reqFilter);
      var count = 0;
      for (var key in $scope.filteredNodes) {
        if ($scope.filteredNodes.hasOwnProperty(key)) {
          count++;
        }
      }
      $scope.totalItems = count;
      $scope.numPages = Math.ceil($scope.totalItems / $scope.pageSize);
    });

    // Initializes the requisition page
    if ($scope.foreignSource) {
      $scope.refresh();
    }

  }]);

}());
