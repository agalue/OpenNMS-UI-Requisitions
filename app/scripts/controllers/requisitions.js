// Controller for the requisitions page (list/add/remove/synchronize requisitions)
// Author: Alejandro Galue <agalue@opennms.org>

(function() {

  'use strict';

  angular.module('onms-requisitions')

  .controller('RequisitionsController', ['$scope', '$filter', 'RequisitionsService', 'growl', function($scope, $filter, RequisitionsService, growl) {

    $scope.requisitions = {};
    $scope.filteredRequisitions = {};
    $scope.pageSize = 10;
    $scope.maxSize = 5;
    $scope.totalItems = 0;

    $scope.countFilteredRequisitions = function() {
      var count = 0;
      for (var key in $scope.filteredRequisitions) {
        if ($scope.filteredRequisitions.hasOwnProperty(key)) {
          count++;
        }
      }
      return count;
    };

    // Resets the default set of detectors and policies
    $scope.resetDefaultForeignSource = function() {
      growl.addWarnMessage('Cannot reset default foreign source definition. Not implemented yet.'); // FIXME
    };

    // Clones the detectors and policies of a specific requisition
    $scope.cloneForeignSource = function(foreignSource) {
      growl.addWarnMessage('Cannot clone foreign source definitions for ' + foreignSource + '. Not implemented yet.'); // FIXME
    };

    // Adds a new requisition on the server
    $scope.addRequisition = function() {
      var foreignSource = window.prompt('Please enter the name for the new requisition'); // TODO Beautify prompt
      if (foreignSource) {
        RequisitionsService.addRequisition(foreignSource).then(
          function(requisition) { // success
            $scope.requisitions[foreignSource] = requisition;
            growl.addSuccessMessage('The requisition ' + foreignSource + ' has been created.');
          }, // error
          function() {
            growl.addErrorMessage('Cannot create the requisition' + foreignSource);
          }
        );
      }
    };

    // Requests the synchronization/import of a requisition on the server
    $scope.synchronize = function(foreignSource) {
      RequisitionsService.synchronizeRequisition(foreignSource).then(
        function() { // success
          $scope.requisitions[foreignSource].setDeployed(true);
          growl.addSuccessMessage('The import operation has been started for ' + foreignSource);
        },
        function() { // error
          growl.addErrorMessage('Cannot request the import of ' + foreignSource);
        }
      );
    };

    // Removes all the nodes form the requisition on the server
    $scope.removeAllNodes = function(foreignSource) {
      RequisitionsService.removeAllNodesFromRequisition(foreignSource).then(
        function() { // success
          $scope.requisitions[foreignSource].setDeployed(false);
          growl.addSuccessMessage('All the nodes from ' + foreignSource + ' have been removed');
        },
        function() { // error
          growl.addErrorMessage('Cannot remove all the nodes from ' + foreignSource);
        }
      );
    };

    // Remove a requisition on the server
    $scope.deleteRequisition = function(foreignSource) {
      RequisitionsService.deleteRequisition(foreignSource).then(
        function() { // success
          delete $scope.requisitions[foreignSource];
          growl.addSuccessMessage('The requisition ' + foreignSource + ' has been deleted.');
        },
        function() { // error
          growl.addErrorMessage('Cannot delete the requisition ' + foreignSource);
        }
      );
    };

    // Refresh the local requisitions list from the server
    $scope.refresh = function() {
      growl.addInfoMessage('Retrieving requisitions...');
      RequisitionsService.getRequisitions().then(
        function(data) { // success
          $scope.currentPage = 1;
          $scope.requisitions = data.requisitions;
          $scope.totalItems = data.requisitionsCount();
          $scope.numPages = Math.ceil($scope.totalItems / $scope.pageSize);
          $scope.filteredRequisitions = data.requisitions;
        },
        function() { // error
          growl.addErrorMessage('Cannot retrieve the configured requisitions');
        }
      );
    };

    // Watch for filter changes in order to update the nodes list and updates the pagination control
    $scope.$watch('reqFilter', function() {
      $scope.currentPage = 1;
      $scope.filteredRequisitions = $filter('filter')($scope.requisitions, $scope.reqFilter);
      $scope.totalItems = $scope.countFilteredRequisitions();
      $scope.numPages = Math.ceil($scope.totalItems / $scope.pageSize);
    });

    // Initializes the requisitions page
    if ($scope.countFilteredRequisitions() == 0) {
      $scope.refresh();
    }

  }]);

}());
