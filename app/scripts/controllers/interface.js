// Controller for the modal dialog for add/edit interfaces
// Author: Alejandro Galue <agalue@opennms.org>

(function() {

  'use strict';

  angular.module('onms-requisitions')

  .controller('InterfaceController', ['$scope', '$modalInstance', 'intf', function($scope, $modalInstance, intf) {

    $scope.intf = intf;
    $scope.snmpPrimaryFields = [
      { id: 'P', title: 'Primary' },
      { id: 'S', title: 'Secondary' },
      { id: 'N', title: 'Not Elegible'}
    ];

    $scope.save = function () {
      $modalInstance.close($scope.intf);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.addService = function() {
      $scope.intf['monitored-service'].push({ 'service-name': ''});
    };

    $scope.removeService = function(index) {
      $scope.intf['monitored-service'].splice(index, 1);
    }

  }]);

}());