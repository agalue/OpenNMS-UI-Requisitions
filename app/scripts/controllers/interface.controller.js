// Controller for the modal dialog for add/edit interfaces
// Author: Alejandro Galue <agalue@opennms.org>

(function() {

  'use strict';

  angular.module('onms-requisitions')

  /**
  * @ngdoc controller
  * @name InterfaceController
  * @module onms-requisitions
  *
  * @requires $scope Angular local scope
  * @requires $modalInstance Angular modal instance
  * @requires intf Interface policy object
  *
  * @description The controller for manage IP interfaces of requisitioned nodes
  */
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
      $scope.intf.services.push({ name: '' });
    };

    $scope.removeService = function(index) {
      $scope.intf.services.splice(index, 1);
    };

  }]);

}());
