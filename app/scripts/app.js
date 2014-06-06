(function() {

  'use strict';

  angular.module('onms-requisitions', [
    'ngRoute',
    'ui.bootstrap',
    'ngAnimate',
    'angular-growl',
    'angular-loading-bar'
    ])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
    .when('/requisitions', {
      templateUrl: 'views/requisitions.html',
      controller: 'RequisitionsController'
    })
    .when('/requisition/:foreignSource', {
      templateUrl: 'views/requisition.html',
      controller: 'RequisitionController'
    })
    .when('/foreignSource/:foreignSource', {
      templateUrl: 'views/foreignsource.html',
      controller: 'ForeignSourceController'
    })
    .when('/node/:foreignSource/:foreignId', {
      templateUrl: 'views/node.html',
      controller: 'NodeController'
    })
    .otherwise({
      redirectTo: '/requisitions'
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
