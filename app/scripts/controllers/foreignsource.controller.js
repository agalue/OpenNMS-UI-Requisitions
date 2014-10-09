// Controller for the policies/detectors
// Author: Alejandro Galue <agalue@opennms.org>

(function() {

  'use strict';

  angular.module('onms-requisitions')

  /**
  * @ngdoc controller
  * @name ForeignSourceController
  * @module onms-requisitions
  *
  * @requires $scope Angular local scope
  * @requires $routeParams Angular route parameters
  * @requires $window Document window
  * @requires $modal Angular modal
  * @requires RequisitionsService The requisitions service
  * @requires growl The growl plugin for instant notifications
  *
  * @description The controller for manage foreign source definitions (i.e. policies and detectors)
  */
  .controller('ForeignSourceController', ['$scope', '$routeParams', '$window', '$modal', 'RequisitionsService', 'growl', function($scope, $routeParams, $window, $modal, RequisitionsService, growl) {

    $scope.foreignSource = $routeParams.foreignSource;
    $scope.foreignSourceDef = {};

    $scope.goBack = function() {
      $window.location.href = '#/requisitions/' + $scope.foreignSource;
    };

    $scope.goTop = function() {
      $window.location.href = '#/requisitions';
    };

    $scope.errorHandler = function(message) {
      growl.addErrorMessage(message);
    };

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
        $scope.errorHandler
      );
    };

    // Refresh the local node from the server
    $scope.refresh = function() {
      growl.addInfoMessage('Retrieving definition for requisition ' + $scope.foreignSource + '...');
      RequisitionsService.getForeignSourceDefinition($scope.foreignSource).then(
        function(data) { // success
          $scope.foreignSourceDef = data;
        },
        $scope.errorHandler
      );
    };

    // Initialize the page
    if ($scope.foreignSource) {
      $scope.refresh();
    }
  }]);

}());
