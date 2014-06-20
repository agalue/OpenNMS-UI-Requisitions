// Controller for the node page (add/edit the nodes on a specific requisition)
// Author: Alejandro Galue <agalue@opennms.org>

(function() {

  'use strict';

  angular.module('onms-requisitions')

  .controller('NodeController', ['$scope', '$routeParams', '$modal', 'RequisitionsService', 'growl', function($scope, $routeParams, $modal, RequisitionsService, growl) {

    $scope.foreignSource = $routeParams.foreignSource;
    $scope.foreignId = $routeParams.foreignId;
    $scope.node = {};

    $scope.errorHandler = function(message) {
      growl.addErrorMessage(message);
    };

    // Shows the dialog for add/edit an asset field
    $scope.editAsset = function(index, isNew) {
      var assetToEdit = $scope.node.assets[index];

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
          $scope.node.assets.pop();
        }
      });
    };

    // Removes an asset from the local node
    $scope.removeAsset = function(index) {
      $scope.node.assets.splice(index, 1);
    };

    // Adds an asset to the local node
    $scope.addAsset = function() {
      $scope.editAsset($scope.node.addNewAsset(), true);
    };

    // Shows the dialog for add/edit an interface
    $scope.editInterface = function(index, isNew) {
      var intfToEdit = $scope.node.interfaces[index];

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
          $scope.node.interfaces.pop();
        }
      });
    };

    // Removes an interface from the local node
    $scope.removeInterface = function(index) {
      $scope.node.interfaces.splice(index, 1);
    };

    // Adds an interface to the local node
    $scope.addInterface = function() {
      $scope.editInterface($scope.node.addNewInterface(), true);
    };

    // Removes a category from the local node
    $scope.removeCategory = function(index) {
      $scope.node.categories.splice(index, 1);
    };

    // Adds a category from the local node
    $scope.addCategory = function() {
      $scope.node.addNewCategory();
    };

    // Saves the local node on the server
    $scope.save = function() {
      RequisitionsService.saveNode($scope.node).then(
        function() { // success
          $scope.node.deployed = false;
          growl.addSuccessMessage('The node ' + $scope.node.nodeLabel + ' has been saved.');
        },
        $scope.errorHandler 
      );
    };

    // Refresh the local node from the server
    $scope.refresh = function() {
      growl.addInfoMessage('Retrieving node ' + $scope.foreignId + ' from requisition ' + $scope.foreignSource + '...');
      RequisitionsService.getNode($scope.foreignSource, $scope.foreignId).then(
        function(node) { // success
          $scope.node = node;
        },
        $scope.errorHandler 
      );
    };

    // Initialize the node's page for either adding a new node or editing an existing node
    if ($scope.foreignId == '__new__') {
      $scope.node = new RequisitionNode($scope.foreignSource, {});
    } else {
      $scope.refresh();
    }
  }]);

}());
