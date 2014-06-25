// Controller for the requisitions page (list/add/remove/synchronize requisitions)
// Author: Alejandro Galue <agalue@opennms.org>

(function() {

  'use strict';

  angular.module('onms-requisitions')

  .controller('RequisitionsController', ['$scope', '$filter', 'RequisitionsService', 'growl', function($scope, $filter, RequisitionsService, growl) {

    $scope.requisitions = [];
    $scope.filteredRequisitions = [];
    $scope.pageSize = 10;
    $scope.maxSize = 5;
    $scope.totalItems = 0;

    // Common error handling
    $scope.errorHandler = function(message) {
      growl.addErrorMessage(message);
    };

    // Return the index of a requisition
    $scope.indexOfRequisition = function(foreignSource) {
      for(var i = 0; i < $scope.requisitions.length; i++) {
        if ($scope.requisitions[i].foreignSource === foreignSource) {
          return i;
        }
      }
      return -1;
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
            $scope.requisitions.push(requisition);
            growl.addSuccessMessage('The requisition ' + foreignSource + ' has been created.');
          },
          $scope.errorHandler
        );
      }
    };

    // Requests the synchronization/import of a requisition on the server
    // FIXME Implement rescanExisting on the view
    $scope.synchronize = function(foreignSource, rescanExisting) {
      RequisitionsService.synchronizeRequisition(foreignSource, rescanExisting).then(
        function() { // success
          var idx = $scope.indexOfRequisition(foreignSource);
          $scope.requisitions[idx].setDeployed(true);
          growl.addSuccessMessage('The import operation has been started for ' + foreignSource);
        },
        $scope.errorHandler
      );
    };

    // Removes all the nodes form the requisition on the server
    $scope.removeAllNodes = function(foreignSource) {
      RequisitionsService.removeAllNodesFromRequisition(foreignSource).then(
        function() { // success
          var idx = $scope.indexOfRequisition(foreignSource);
          $scope.requisitions[idx].setDeployed(false);
          growl.addSuccessMessage('All the nodes from ' + foreignSource + ' have been removed');
        },
        $scope.errorHandler
      );
    };

    // Remove a requisition on the server
    $scope.deleteRequisition = function(foreignSource) {
      RequisitionsService.deleteRequisition(foreignSource).then(
        function() { // success
          var idx = $scope.indexOfRequisition(foreignSource);
          $scope.requisitions.splice(idx, 1);
          growl.addSuccessMessage('The requisition ' + foreignSource + ' has been deleted.');
        },
        $scope.errorHandler
      );
    };

    // Refresh the local requisitions list from the server
    $scope.refreshRequisitions = function() {
      growl.addInfoMessage('Refreshing requisitions...');
      RequisitionsService.clearRequisitionsCache();
      $scope.initializeRequisitions();
    };

    // Initialize the local requisitions list
    $scope.initializeRequisitions = function() {
      growl.addInfoMessage('Initializing requisitions...');
      RequisitionsService.getRequisitions().then(
        function(data) { // success
          $scope.currentPage = 1;
          $scope.requisitions = data.requisitions;
          $scope.totalItems = data.requisitions.length;
          $scope.numPages = Math.ceil($scope.totalItems / $scope.pageSize);
          $scope.filteredRequisitions = data.requisitions;
        },
        $scope.errorHandler
      );
    };

    // Watch for filter changes in order to update the nodes list and updates the pagination control
    $scope.$watch('reqFilter', function() {
      $scope.currentPage = 1;
      $scope.filteredRequisitions = $filter('filter')($scope.requisitions, $scope.reqFilter);
      $scope.totalItems = $scope.filteredRequisitions.length;
      $scope.numPages = Math.ceil($scope.totalItems / $scope.pageSize);
    });

    // Initializes the requisitions page
    if ($scope.filteredRequisitions.length == 0) {
      $scope.initializeRequisitions();
    }

  }]);

}());
