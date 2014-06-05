// Controller for the requisitions page (list/add/remove/synchronize requisitions)
// Author: Alejandro Galue <agalue@opennms.org>

(function() {

  'use strict';

  angular.module('onms-requisitions')

  .controller('RequisitionsController', ['$scope', '$http', '$filter', 'growl', function($scope, $http, $filter, growl) {

    $scope.requisitions = [];
    $scope.filteredRequisitions = [];
    $scope.pageSize = 10;
    $scope.maxSize = 5;
    $scope.totalItems = 0;

    // Watch for filter changes in order to update the nodes list and updates the pagination control
    $scope.$watch('reqFilter', function() {
      $scope.currentPage = 1;
      $scope.filteredRequisitions = $filter('filter')($scope.requisitions['model-import'], $scope.reqFilter);
      $scope.totalItems = $scope.filteredRequisitions ? $scope.filteredRequisitions.length : 0;
      $scope.numPages = Math.ceil($scope.totalItems / $scope.pageSize);
    });

    // Resets the default set of detectors and policies
    $scope.resetDefaultForeignSource = function() {
      growl.addWarnMessage("Not implemented yet."); // FIXME
    }

    // Clones the detectors and policies of a specific requisition
    $scope.cloneForeignSource = function(requisition) {
      growl.addWarnMessage("Not implemented yet."); // FIXME
    }

    // Adds a new requisition on the server
    $scope.addRequisition = function() {
      var foreignSource = prompt("Please enter the name for the new requisition");
      if (foreignSource) {
        $http.post('/opennms/rest/requisitions', { 'foreign-source': foreignSource })
        .success(function() {
          $scope.requisitions['model-import'].push({'foreign-source': foreignSource });
          growl.addSuccessMessage('The requisition ' + foreignSource + ' has been created.');
        })
        .error(function() {
          growl.addErrorMessage('Cannot create the requisition' + foreignSource);
        })
      }
    };

    // Requests the synchronization/import of a requisition on the server
    $scope.synchronize = function(requisition) {
      $http.put('/opennms/rest/requisitions/' + requisition['foreign-source'] + '/import')
      .success(function() {
        growl.addSuccessMessage('The import operation has been started for ' + requisition['foreign-source']);
      })
      .error(function() {
        growl.addErrorMessage('Cannot request the import of ' + requisition['foreign-source']);
      });
    };

    // Removes all the nodes form the requisition on the server
    $scope.removeAllNodes = function(requisition) {
      requisition['node'] = [];
      $http.post('/opennms/rest/requisitions/', requisition)
      .success(function() {
        growl.addSuccessMessage('All the nodes from ' + requisition['foreign-source'] + ' have been removed');
      })
      .error(function() {
        growl.addErrorMessage('Cannot remove all the nodes from ' + requisition['foreign-source']);
      });
    };

    // Remove a requisition on the server
    $scope.deleteRequisition = function(requisition) {
      $http.delete('/opennms/rest/requisitions/' + requisition['foreign-source'])
      .success(function() {
        var index = -1;
        for (var i=0; i < $scope.requisitions['model-import'].length; i++) {
          if (requisition['foreign-source'] == $scope.requisitions['model-import'][i]['foreign-source']) {
            index = i;
            break;
          }
        }
        if (i > -1) {
          $scope.requisitions['model-import'].splice(index, 1);
        }
        growl.addSuccessMessage('The requisition ' + requisition['foreign-source'] + ' has been deleted.');
      })
      .error(function() {
        growl.addErrorMessage('Cannot detele the requisition ' + requisition['foreign-source']);
      });
    };

    // Refresh the local requisitions list from the server
    $scope.refresh = function() {
      $http.get('/opennms/rest/requisitions')
      .success(function(data) {
        $scope.currentPage = 1;
        $scope.requisitions = data;
        $scope.totalItems = data['model-import'].length;
        $scope.numPages = Math.ceil($scope.totalItems / $scope.pageSize);
        $scope.filteredRequisitions = data['model-import'];
      })
      .error(function() {
        growl.addErrorMessage('Cannot retrieve the configured requisitions');
      });
    };

    // Initializes the requisitions page
    $scope.refresh();
  }]);

}());
