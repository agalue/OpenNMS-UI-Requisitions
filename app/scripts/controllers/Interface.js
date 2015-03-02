/**
* @author Alejandro Galue <agalue@opennms.org>
* @copyright 2014 The OpenNMS Group, Inc.
*/

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
  * @requires RequisitionsService The Requisitions Servive
  * @requires EmptyTypeaheadService The empty typeahead Service
  * @requires intf Interface policy object
  *
  * @description The controller for manage the modal dialog for add/edit IP interfaces of requisitioned nodes
  */
  .controller('InterfaceController', ['$scope', '$modalInstance', 'RequisitionsService', 'EmptyTypeaheadService', 'intf', function($scope, $modalInstance, RequisitionsService, EmptyTypeaheadService, intf) {

    /**
    * @description The interface object
    *
    * @ngdoc property
    * @name InterfaceController#intf
    * @propertyOf InterfaceController
    * @returns {object} The interface object
    */
    $scope.intf = intf;

    /**
    * @description An array map with the valid values for snmp-primary
    *
    * @ngdoc property
    * @name InterfaceController#snmpPrimaryFields
    * @propertyOf InterfaceController
    * @returns {object} The snmp primary fields object
    */
    $scope.snmpPrimaryFields = [
      { id: 'P', title: 'Primary' },
      { id: 'S', title: 'Secondary' },
      { id: 'N', title: 'Not Elegible'}
    ];

    /**
    * @description The available asset fields
    *
    * @ngdoc property
    * @name InterfaceController#availableServices
    * @propertyOf InterfaceController
    * @returns {array} List of available services
    */
    $scope.availableServices = [];

    /**
    * @description fieldComparator method from EmptyTypeaheadService
    *
    * @ngdoc method
    * @name InterfaceController#fieldComparator
    * @methodOf AssetController
    */
    $scope.fieldComparator = EmptyTypeaheadService.fieldComparator;

    /**
    * @description onFocus method from EmptyTypeaheadService
    *
    * @ngdoc method
    * @name InterfaceController#onFocus
    * @methodOf AssetController
    */
    $scope.onFocus = EmptyTypeaheadService.onFocus;

    /**
    * @description Saves the current interface
    *
    * @name InterfaceController:save
    * @ngdoc method
    * @methodOf InterfaceController
    */
    $scope.save = function () {
      $modalInstance.close($scope.intf);
    };

    /**
    * @description Cancels the current operation
    *
    * @name InterfaceController:cancel
    * @ngdoc method
    * @methodOf InterfaceController
    */
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    /**
    * @description Adds a new empty service
    *
    * @name InterfaceController:addService
    * @ngdoc method
    * @methodOf InterfaceController
    */
    $scope.addService = function() {
      $scope.intf.services.push({ name: '' });
    };

    /**
    * @description Removes a service
    *
    * @name InterfaceController:removeService
    * @ngdoc method
    * @methodOf InterfaceController
    * @param {integer} index The index of the service to remove
    */
    $scope.removeService = function(index) {
      $scope.intf.services.splice(index, 1);
    };

    // Initialization

    RequisitionsService.getAvailableServices().then(function(services) {
      $scope.availableServices = services;
    });

  }]);

}());