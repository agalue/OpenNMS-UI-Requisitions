(function() {

  'use strict';

  angular.module('onms-requisitions')

  .controller('DummyController', ['$scope', '$log', function($scope, $log) {

    $scope.developerName = 'Alejandro';
    $log.warn('Dummy initialized');

  }]);

}());
