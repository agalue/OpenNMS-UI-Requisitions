// Controller for the requisition page (add/edit the requisition)
// Author: Alejandro Galue <agalue@opennms.org>

(function() {

  'use strict';

  angular.module('onms-requisitions')

  .controller('RequisitionController', ['$scope', '$http', '$filter', '$stateParams', 'growl', function($scope, $http, $filter, $stateParams, growl) {

    $scope.foreignSource = $stateParams.foreignSource;
    $scope.requisition = { node: [] };
    $scope.filteredNodes = [];
    $scope.pageSize = 10;
    $scope.maxSize = 5;
    $scope.totalItems = 0;

    // Watch for filter changes in order to update the nodes list and updates the pagination control
    $scope.$watch('reqFilter', function() {
      $scope.currentPage = 1;
      $scope.filteredNodes = $filter('filter')($scope.requisition.node, $scope.reqFilter);
      $scope.totalItems = $scope.filteredNodes.length
      $scope.numPages = Math.ceil($scope.totalItems / $scope.pageSize);
    });

    // Deletes a node from the requisition on the server and refresh the local nodes list
    $scope.deleteNode = function(node) {
      $http.delete('/opennms/rest/requisitions/' + $scope.foreignSource + '/nodes/' + node['foreign-id'])
      .success(function() {
        $scope.refresh(); // FIXME
        growl.addSuccessMessage('The node ' + node['node-label'] + 'has been deleted.');
      })
      .error(function() {
        growl.addErrorMessage('Cannot delete the node' + node['node-label']);
      });
    };

    // Refresh the local requisition from the server
    $scope.refresh = function() {
      $http.get('/opennms/rest/requisitions/' + $stateParams.foreignSource).success(function(data) {
        $scope.currentPage = 1;
        $scope.requisition = data;
        $scope.totalItems = data.node.length;
        $scope.numPages = Math.ceil($scope.totalItems / $scope.pageSize);
        $scope.filteredNodes = data.node;
      })
      .error(function() {
        growl.addErrorMessage('Cannot retrieve the requisition ' + $stateParams.foreignSource);
      });
    }

    // Initializes the requisition page
    $scope.refresh();
  }]);

}());
