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
  * @requires policy Requisition policy object
  *
  * @description The controller for manage the modal dialog for add/edit requisition policies
  */
  .controller('PolicyController', ['$scope', '$modalInstance', 'policy', function($scope, $modalInstance, policy) {

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

  }]);

}());
