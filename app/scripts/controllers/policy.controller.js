/**
* @author Alejandro Galue <agalue@opennms.org>
* @copyright 2014 The OpenNMS Group, Inc.
*/

(function() {

  'use strict';

  angular.module('onms-requisitions')

  /**
  * @ngdoc controller
  * @name PolicyController
  * @module onms-requisitions
  *
  * @requires $scope Angular local scope
  * @requires $modalInstance Angular modal instance
  * @requires RequisitionsService The Requisitions Servive
  * @requires policy Requisition policy object
  *
  * @description The controller for manage the modal dialog for add/edit requisition policies
  */
  .controller('PolicyController', ['$scope', '$modalInstance', 'RequisitionsService', 'policy', function($scope, $modalInstance, RequisitionsService, policy) {

    /**
     * @description The policy object
     *
     * @ngdoc property
     * @name PolicyController#policy
     * @propertyOf PolicyController
     * @returns {object} The policy object
     */
    $scope.policy = policy;

    /**
     * @description The available policy object
     *
     * @ngdoc property
     * @name PolicyController#availablePolicies
     * @propertyOf PolicyController
     * @returns {array} The policy list
     */
    $scope.availablePolicies = [];

    /**
    * @description Saves the current policy
    *
    * @name PolicyController:save
    * @ngdoc method
    * @methodOf PolicyController
    */
    $scope.save = function () {
      $modalInstance.close($scope.policy);
    };

    /**
    * @description Cancels the current operation
    *
    * @name PolicyController:cancel
    * @ngdoc method
    * @methodOf PolicyController
    */
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    /**
    * @description Adds a new empty parameter to the current policy
    *
    * @name PolicyController:addParameter
    * @ngdoc method
    * @methodOf PolicyController
    */
    $scope.addParameter = function() {
      $scope.policy.parameter.push({ 'key': '', 'value': '' });
    };

    /**
    * @description Removes a parameter from the current policy
    *
    * @name PolicyController:removeParameter
    * @ngdoc method
    * @methodOf PolicyController
    * @param {integer} index The index of the parameter to remove
    */
    $scope.removeParameter = function(index) {
      $scope.policy.parameter.splice(index, 1);
    };

    /**
    * @description Update policy parameters after changing the policy class.
    *
    * @name PolicyController:updatePolicyParameters
    * @ngdoc method
    * @methodOf PolicyController
    * @param {object} policyConfig the configuration of the selected policy
    */
    $scope.updatePolicyParameters = function(policyConfig) {
      if (policyConfig == null) {
        return;
      }
      $scope.policy.parameter = [];
      angular.forEach($scope.availablePolicies, function(policy) {
        if (policy.class == policyConfig.class) {
          angular.forEach(policyConfig.parameters, function(param) {
            if (param.required) {
              $scope.policy.parameter.push({ 'key': param.key, 'value': null });
            }
          });
        }
      });
    };

    // Initialize
    RequisitionsService.getAvailablePolicies().then(function(policies) {
      $scope.availablePolicies = policies;
    });

  }]);

}());
