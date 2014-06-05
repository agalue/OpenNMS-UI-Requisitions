// Controller for the modal dialog for add/edit asset fields
// Author: Alejandro Galue <agalue@opennms.org>

(function() {

  'use strict';

  angular.module('onms-requisitions')

  .controller('AssetController', ['$scope', '$modalInstance', 'asset', function($scope, $modalInstance, asset) {

    $scope.asset = asset;
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

    $scope.save = function () {
      $modalInstance.close($scope.asset);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  
  }]);

}());