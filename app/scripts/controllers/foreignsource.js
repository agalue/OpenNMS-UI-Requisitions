// Controller for the policies/detectors
// Author: Alejandro Galue <agalue@opennms.org>

(function() {

  'use strict';

  angular.module('onms-requisitions')

  .controller('ForeignSourceController', ['$scope', '$routeParams', '$modal', 'RequisitionsService', 'growl', function($scope, $routeParams, $modal, RequisitionsService, growl) {

    $scope.foreignSource = $routeParams.foreignSource;
    $scope.foreignSourceDef = {};

    $scope.editPolicy = function(index, isNew) {
      var policyToEdit = $scope.foreignSourceDef.policies[index];

      $modal.open({
        backdrop: true,
        controller: 'PolicyController',
        templateUrl: 'views/policy.html',
        resolve: {
          policy: function() { return angular.copy(policyToEdit); }
        }
      }).result.then(function(result) {
        angular.copy(result, policyToEdit);
      }, function() {
        if (isNew) {
          $scope.foreignSourceDef.policies.pop();
        }
      });
    };

    $scope.removePolicy = function(index) {
      $scope.foreignSourceDef.policies.splice(index, 1);
    };

    $scope.addPolicy = function() {
      $scope.foreignSourceDef.policies.push({ 'name': '', 'class': '', 'parameter': [] });
      $scope.editPolicy($scope.foreignSourceDef.policies.length - 1, true);
    };

    $scope.editDetector = function(index, isNew) {
      var detectorToEdit = $scope.foreignSourceDef.detectors[index];

      $modal.open({
        backdrop: true,
        controller: 'DetectorController',
        templateUrl: 'views/detector.html',
        resolve: {
          detector: function() { return angular.copy(detectorToEdit); }
        }
      }).result.then(function(result) {
        angular.copy(result, detectorToEdit);
      }, function() {
        if (isNew) {
          $scope.foreignSourceDef.detectors.pop();
        }
      });
    };

    $scope.removeDetector = function(index) {
      $scope.foreignSourceDef.detectors.splice(index, 1);
    };

    $scope.addDetector = function() {
      $scope.foreignSourceDef.detectors.push({ 'name': '', 'class': '', 'parameter': [] });
      $scope.editDetector($scope.foreignSourceDef.detectors.length - 1, true);
    };

    // Saves the local foreign source on the server
    $scope.save = function() {
      RequisitionsService.saveForeignSourceDefinition($scope.foreignSourceDef).then(
        function() { // success
          growl.addSuccessMessage('The definition for the requisition ' + $scope.foreignSource + ' has been saved.');
        },
        function() { // error
          growl.addErrorMessage('Cannot save the definition of the requisition ' + $scope.foreignSource + ' on the server.');
        }
      );
    };

    // Refresh the local node from the server
    $scope.refresh = function() {
      growl.addInfoMessage('Retrieving definition for requisition ' + $scope.foreignSource + '...');
      RequisitionsService.getForeignSourceDefinition($scope.foreignSource).then(
        function(data) { // success
          $scope.foreignSourceDef = data;
        },
        function() { // error
          growl.addErrorMessage('Cannot retrieve the policies and detectors from the server.');
        }
      );
    };

    // Initialize the page
    if ($scope.foreignSource) {
      $scope.refresh();
    }
  }]);

}());
