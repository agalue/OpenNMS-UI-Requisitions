/**
* @author Alejandro Galue <agalue@opennms.org>
* @copyright 2014 The OpenNMS Group, Inc.
*/

(function() {

  'use strict';

  angular.module('onms-requisitions')

  /**
  * @ngdoc controller
  * @name AssetController
  * @module onms-requisitions
  *
  * @requires $scope Angular local scope
  * @requires $modalInstance Angular modal instance
  * @requires asset Node asset object
  *
  * @description The controller for manage the modal dialog for add/edit asserts of requisitioned nodes
  */
  .controller('AssetController', ['$scope', '$modalInstance', 'asset', function($scope, $modalInstance, asset) {

    /**
     * @description The asset object
     *
     * @ngdoc property
     * @name AssetController#asset
     * @propertyOf AssetController
     * @returns {object} The asset object
     */
    $scope.asset = asset;

    /**
    * @description The available asset fields
    * @ngdoc property
    * @name AssetController#$scope.assetFields
    * @propertyOf AssetController
    * @returns {array} List of valid asset fields
    */
    $scope.assetFields = [
      'additionalhardware',
      'address1',
      'address2',
      'admin',
      'assetnumber',
      'autoenable',
      'building',
      'category',
      'circuitid',
      'city',
      'comment',
      'connection',
      'country',
      'cpu',
      'dateinstalled',
      'department',
      'description',
      'displaycategory',
      'division',
      'enable',
      'floor',
      'hdd1',
      'hdd2',
      'hdd3',
      'hdd4',
      'hdd5',
      'hdd6',
      'inputpower',
      'lastmodifieddate',
      'latitude',
      'lease',
      'leaseexpires',
      'longitude',
      'maintcontract',
      'maintcontractexpires',
      'managedobjectinstance',
      'managedobjecttype',
      'manufacturer',
      'modelnumber',
      'nodeid',
      'notifycategory',
      'numpowersupplies',
      'operatingsystem',
      'password',
      'pollercategory',
      'port',
      'rack',
      'rackunitheight',
      'ram',
      'region',
      'room',
      'serialnumber',
      'slot',
      'snmpcommunity',
      'state',
      'storagectrl',
      'supportphone',
      'thresholdcategory',
      'userlastmodified',
      'username',
      'vendor',
      'vendorassetnumber',
      'vendorfax',
      'vendorphone',
      'vmwaremanagedentitytype',
      'vmwaremanagedobjectid',
      'vmwaremanagementserver',
      'vmwarestate',
      'vmwaretopologyinfo',
      'zip'
    ];

    /**
    * @description Saves the current asset
    *
    * @name AssetController:save
    * @ngdoc method
    * @methodOf AssetController
    */
    $scope.save = function () {
      $modalInstance.close($scope.asset);
    };

    /**
    * @description Cancels current operation
    *
    * @name AssetController:cancel
    * @ngdoc method
    * @methodOf AssetController
    */
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  
  }]);

}());