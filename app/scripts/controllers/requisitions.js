/* global bootbox:true */

// Controller for the requisitions page (list/add/remove/synchronize requisitions)
// Author: Alejandro Galue <agalue@opennms.org>

(function() {

  'use strict';

  angular.module('onms-requisitions')

  .controller('RequisitionsController', ['$scope', '$filter', '$window', 'RequisitionsService', 'growl', function($scope, $filter, $window, RequisitionsService, growl) {

    $scope.requisitions = [];
    $scope.filteredRequisitions = [];
    $scope.pageSize = 10;
    $scope.maxSize = 5;
    $scope.totalItems = 0;

    // Common error handling
    $scope.errorHandler = function(message) {
      growl.addErrorMessage(message, {ttl: 10000});
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

    // Clones the detectors and policies of a specific requisition
    $scope.clone = function(foreignSource) {
      growl.addWarnMessage('Cannot clone foreign source definitions for ' + foreignSource + '. Not implemented yet.'); // FIXME
    };

    // Adds a new requisition on the server
    $scope.add = function() {
      bootbox.prompt('Please enter the name for the new requisition', function(foreignSource) {
        if (foreignSource) {
          RequisitionsService.addRequisition(foreignSource).then(
            function(r) { // success
              growl.addSuccessMessage('The requisition ' + r.foreignSource + ' has been created.');
            },
            $scope.errorHandler
          );
        }
      });
    };

    // Edits the default foreign source definition
    $scope.editDefaultForeignSource = function() {
      $window.location.href = '#/requisitions/default/foreignSource';
    };

    // Resets the default set of detectors and policies
    $scope.resetDefaultForeignSource = function() {
      growl.addWarnMessage('Cannot reset default foreign source definition. Not implemented yet.'); // FIXME
    };

    // Edits the foreign source definition of an existing requisition
    $scope.editForeignSource = function(foreignSource) {
      $window.location.href = '#/requisitions/' + foreignSource + '/foreignSource';
    };

    // Edits an existing requisition
    $scope.edit = function(foreignSource) {
      $window.location.href = '#/requisitions/' + foreignSource;
    };

    // Requests the synchronization/import of a requisition on the server
    $scope.synchronize = function(foreignSource) {
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

    // Removes all the nodes form the requisition on the server
    $scope.removeAllNodes = function(foreignSource) {
      bootbox.confirm('Are you sure you want to remove all the nodes from ' + foreignSource + '?', function(ok) {
        if (ok) {
          RequisitionsService.removeAllNodesFromRequisition(foreignSource).then(
            function() { // success
              growl.addSuccessMessage('All the nodes from ' + foreignSource + ' have been removed');
            },
            $scope.errorHandler
          );
        }
      });
    };

    // Remove a requisition on the server
    $scope.delete = function(foreignSource) {
      bootbox.confirm('Are you sure you want to remove the requisition ' + foreignSource + '?', function(ok) {
        if (ok) {
          var idx = $scope.indexOfRequisition(foreignSource);
          var deployed = $scope.requisitions[idx].deployed;
          RequisitionsService.deleteRequisition(foreignSource, deployed).then(
            function() { // success
              growl.addSuccessMessage('The requisition ' + foreignSource + ' has been deleted.');
            },
            $scope.errorHandler
          );
        }
      });
    };

    // Refresh the local requisitions list from the server
    $scope.refresh = function() {
      growl.addInfoMessage('Refreshing requisitions...');
      RequisitionsService.clearRequisitionsCache();
      $scope.requisitions = [];
      $scope.initialize();
    };

    // Initialize the local requisitions list
    $scope.initialize = function() {
      RequisitionsService.getRequisitions().then(
        function(data) { // success
          $scope.currentPage = 1;
          $scope.requisitions = data.requisitions;
          $scope.totalItems = data.requisitions.length;
          $scope.numPages = Math.ceil($scope.totalItems / $scope.pageSize);
          $scope.filteredRequisitions = data.requisitions;
          growl.addInfoMessage('Loaded ' + data.requisitions.length + ' requisitions...');
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
    if ($scope.filteredRequisitions.length === 0) {
      $scope.initialize();
    }

  }]);

}());
