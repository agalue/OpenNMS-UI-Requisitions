/**
* @author Alejandro Galue <agalue@opennms.org>
* @copyright 2014 The OpenNMS Group, Inc.
*/

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

    /**
     * @description The foreign source (a.k.a the name of the requisition).
     * The default value is obtained from the $routeParams.
     *
     * @ngdoc property
     * @name ForeignSourceController#foreignSource
     * @propertyOf ForeignSourceController
     * @returns {string} The foreign source
     */
    $scope.foreignSource = $routeParams.foreignSource;

    /**
     * @description The foreign source definition object
     * @ngdoc property
     * @name ForeignSourceController#foreignSourceDef
     * @propertyOf ForeignSourceController
     * @returns {object} The foreign source definition
     */
    $scope.foreignSourceDef = {};

    /**
    * @description Goes back to requisition editor (navigation)
    *
    * @name ForeignSourceController:goBack
    * @ngdoc method
    * @methodOf ForeignSourceController
    */
    $scope.goBack = function() {
      $window.location.href = '#/requisitions/' + $scope.foreignSource;
    };

    /**
    * @description Goes to requisitions list (navigation)
    *
    * @name ForeignSourceController:goTop
    * @ngdoc method
    * @methodOf ForeignSourceController
    */
    $scope.goTop = function() {
      $window.location.href = '#/requisitions';
    };

    /**
    * @description Shows an error to the user
    *
    * @name ForeignSourceController:errorHandler
    * @ngdoc method
    * @methodOf ForeignSourceController
    * @param {string} message The error message
    */
    $scope.errorHandler = function(message) {
      growl.error(message, {ttl: 10000});
    };

    /**
    * @description Opens the modal window to add/edit a policy
    *
    * @name ForeignSourceController:editPolicy
    * @ngdoc method
    * @methodOf ForeignSourceController
    * @param {integer} index The index of the policy to edit
    * @param {boolean} isNew true, if the policy is new
    */
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

    /**
    * @description Removes a policy
    *
    * @name ForeignSourceController:removePolicy
    * @ngdoc method
    * @methodOf ForeignSourceController
    * @param {integer} index The index of the policy to remove
    */
    $scope.removePolicy = function(index) {
      $scope.foreignSourceDef.policies.splice(index, 1);
    };

    /**
    * @description Adds a new policy
    *
    * @name ForeignSourceController:addPolicy
    * @ngdoc method
    * @methodOf ForeignSourceController
    */
    $scope.addPolicy = function() {
      $scope.foreignSourceDef.policies.push({ 'name': '', 'class': '', 'parameter': [] });
      $scope.editPolicy($scope.foreignSourceDef.policies.length - 1, true);
    };

    /**
    * @description Opens the modal window to add/edit a detector
    *
    * @name ForeignSourceController:editDetector
    * @ngdoc method
    * @methodOf ForeignSourceController
    * @param {integer} index The index of the detector to edit
    * @param {boolean} isNew true, if the detector is new
    */
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

    /**
    * @description Removes a detector
    *
    * @name ForeignSourceController:removeDetector
    * @ngdoc method
    * @methodOf ForeignSourceController
    * @param {integer} index The index of the detector to remove
    */
    $scope.removeDetector = function(index) {
      $scope.foreignSourceDef.detectors.splice(index, 1);
    };

    /**
    * @description Adds a new detector
    *
    * @name ForeignSourceController:addDetector
    * @ngdoc method
    * @methodOf ForeignSourceController
    */
    $scope.addDetector = function() {
      $scope.foreignSourceDef.detectors.push({ 'name': '', 'class': '', 'parameter': [] });
      $scope.editDetector($scope.foreignSourceDef.detectors.length - 1, true);
    };

    /**
    * @description Saves the local foreign source on the server
    *
    * @name ForeignSourceController:save
    * @ngdoc method
    * @methodOf ForeignSourceController
    */
    $scope.save = function() {
      RequisitionsService.saveForeignSourceDefinition($scope.foreignSourceDef).then(
        function() { // success
          growl.success('The definition for the requisition ' + $scope.foreignSource + ' has been saved.');
        },
        $scope.errorHandler
      );
    };

    /**
    * @description Refreshes the local node from the server
    *
    * @name ForeignSourceController:refresh
    * @ngdoc method
    * @methodOf ForeignSourceController
    */
    $scope.refresh = function() {
      growl.info('Retrieving definition for requisition ' + $scope.foreignSource + '...');
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
