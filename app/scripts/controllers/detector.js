// Controller for the modal dialog for add/edit detectors
// Author: Alejandro Galue <agalue@opennms.org>

(function() {

  'use strict';

  angular.module('onms-requisitions')

  .controller('DetectorController', ['$scope', '$modalInstance', 'detector', function($scope, $modalInstance, detector) {

    $scope.detector = detector;

    $scope.save = function () {
      $modalInstance.close($scope.detector);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.addParameter = function() {
      $scope.detector.parameter.push({ 'key': '', 'value': '' });
    };

    $scope.removeParameter = function(index) {
      $scope.detector.parameter.splice(index, 1);
    };

  }]);

}());
