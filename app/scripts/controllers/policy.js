// Controller for the modal dialog for add/edit policies
// Author: Alejandro Galue <agalue@opennms.org>

(function() {

  'use strict';

  angular.module('onms-requisitions')

  .controller('PolicyController', ['$scope', '$modalInstance', 'policy', function($scope, $modalInstance, policy) {

    $scope.policy = policy;

    $scope.save = function () {
      $modalInstance.close($scope.policy);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.addParameter = function() {
      $scope.policy.parameter.push({ 'key': '', 'value': '' });
    };

    $scope.removeParameter = function(index) {
      $scope.policy.parameter.splice(index, 1);
    };

  }]);

}());
