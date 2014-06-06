// Controller for the node page (add/edit the nodes on a specific requisition)
// Author: Alejandro Galue <agalue@opennms.org>

(function() {

  'use strict';

  angular.module('onms-requisitions')

  .controller('NodeController', ['$scope', '$http', '$routeParams', '$modal', 'growl', function($scope, $http, $routeParams, $modal, growl) {

    var nodeUrl = '/opennms/rest/requisitions/' + $routeParams.foreignSource + '/nodes/';

    $scope.foreignSource = $routeParams.foreignSource;
    $scope.foreignId = $routeParams.foreignId;
    $scope.node = {};

    // Shows the dialog for add/edit an asset field
    $scope.editAsset = function(index, isNew) {
      var assetToEdit = $scope.node.asset[index];

      var modalInstance = $modal.open({
        backdrop: true,
        controller: 'AssetController',
        templateUrl: 'views/asset.html',
        resolve: {
          asset: function() { return angular.copy(assetToEdit); }
        }
      });

      modalInstance.result.then(function(result) {
        angular.copy(result, assetToEdit);
      }, function() {
        if (isNew) {
          $scope.node.asset.pop();
        }
      });
    };

    // Removes an asset from the local node
    $scope.removeAsset = function(index) {
      $scope.node.asset.splice(index, 1);
    };

    // Adds an asset to the local node
    $scope.addAsset = function() {
      $scope.node.asset.push({ name: '', value: '' });
      $scope.editAsset($scope.node.asset.length - 1, true);
    };

    // Shows the dialog for add/edit an interface
    $scope.editInterface = function(index, isNew) {
      var intfToEdit = $scope.node.interface[index];

      var modalInstance = $modal.open({
        backdrop: true,
        controller: 'InterfaceController',
        templateUrl: 'views/interface.html',
        resolve: {
          intf: function() { return angular.copy(intfToEdit); }
        }
      });

      modalInstance.result.then(function(result) {
        angular.copy(result, intfToEdit);
      }, function() {
        if (isNew) {
          $scope.node.interface.pop();
        }
      });
    };

    // Removes an interface from the local node
    $scope.removeInterface = function(index) {
      $scope.node.interface.splice(index, 1);
    };

    // Adds an interface to the local node
    $scope.addInterface = function() {
      $scope.node.interface.push({ 'ip-addr': '', 'descr': '', 'snmp-primary': '', 'monitored-service': [] });
      $scope.editInterface($scope.node.interface.length - 1, true);
    };

    // Removes a category from the local node
    $scope.removeCategory = function(index) {
      $scope.node.category.splice(index, 1);
    };

    // Adds a category from the local node
    $scope.addCategory = function() {
      $scope.node.category.push({ 'name': '' });
    };

    // Saves the local node on the server
    $scope.save = function() {
      $http.post(nodeUrl, $scope.node)
      .success(function() {
        growl.addSuccessMessage('The node ' + $scope.node['node-label'] + ' has been saved.');
      })
      .error(function() {
        growl.addErrorMessage('Cannot save the node ' + $scope.node['node-label'] + ' on the server.');
      });
    };

    // Refresh the local node from the server
    $scope.refresh = function() {
      $http.get(nodeUrl + $routeParams.foreignId)
      .success(function(data) {
        $scope.node = data;
      })
      .error(function() {
        growl.addErrorMessage('Cannot retrieve the nodes from the server.');
      });
    };

    // Initialize the node's page for either adding a new node or editing an existing node
    if ($routeParams.foreignId !== '__new__') {
      $scope.refresh();
    } else {
      $scope.node = { 'interface': [], 'asset': [], 'category': [] };
    }
  }]);

}());
