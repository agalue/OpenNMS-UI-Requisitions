(function() {

  'use strict';

  angular.module('onms-requisitions', [
    'ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'angular-growl',
    'angular-loading-bar'
    ])

  .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/requisitions");

    $stateProvider
    .state('requisitions', {
      url: '/requisitions',
      templateUrl: 'views/requisitions.html',
      controller: 'RequisitionsController'
    })
    .state('requisition', {
      url: '/requisition/:foreignSource',
      templateUrl: 'views/requisition.html',
      controller: 'RequisitionController'
    })
    .state('foreignSource', {
      url: '/foreignSource/:foreignSource',
      templateUrl: 'views/foreignsource.html',
      controller: 'ForeignSourceController'
    })
    .state('node', {
      url: '/node/:foreignSource/:foreignId',
      templateUrl: 'views/node.html',
      controller: 'NodeController'
    });
  }])

  .config(['growlProvider', function(growlProvider) {
    growlProvider.globalTimeToLive(5000);
  }])

  .config(['$tooltipProvider', function($tooltipProvider) {
    $tooltipProvider.setTriggers({
      'mouseenter': 'mouseleave'
    });
    $tooltipProvider.options({
      'placement': 'left',
      'trigger': 'mouseenter'
    });
  }]);

}());
