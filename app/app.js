/**
* @author Alejandro Galue <agalue@opennms.org>
* @copyright 2014 The OpenNMS Group, Inc.
*/

(function() {

  'use strict';

  var angular = require('angular');

  // Load Libraries and Extensions
  require('angular-route');
  require('angular-cookies');
  require('angular-ui-bootstrap');
  require('angular-loading-bar');
  require('angular-growl-v2');
  require('ip-address');
  require('bootbox');

  // Load Directives and Filters
  require('./scripts/directives/requisitionConstraints.js');
  require('./scripts/filters/startFrom.js');

  // Load Application Services
  require('./scripts/services/Requisitions.js');
  require('./scripts/services/Synchronize.js');

  // Load Application Controllers
  require('./scripts/controllers/Asset.js');
  require('./scripts/controllers/CloneForeignSource.js');
  require('./scripts/controllers/Detector.js');
  require('./scripts/controllers/ForeignSource.js');
  require('./scripts/controllers/Interface.js');
  require('./scripts/controllers/Move.js');
  require('./scripts/controllers/Node.js');
  require('./scripts/controllers/Policy.js');
  require('./scripts/controllers/QuickAddNode.js');
  require('./scripts/controllers/QuickAddNodeModal.js');
  require('./scripts/controllers/Requisition.js');
  require('./scripts/controllers/Requisitions.js');

  angular.module('onms-requisitions', [
    'ngRoute',
    'ngCookies',
    'ngAnimate',
    'ui.bootstrap',
    'angular-growl',
    'angular-loading-bar'
  ])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
    .when('/requisitions', {
      templateUrl: require('ngtemplate!./views/requisitions.html'),
      controller: 'RequisitionsController'
    })
    .when('/requisitions/:foreignSource', {
      templateUrl: require('ngtemplate!./views/requisition.html'),
      controller: 'RequisitionController'
    })
    .when('/requisitions/:foreignSource/foreignSource', {
      templateUrl: require('ngtemplate!./views/foreignsource.html'),
      controller: 'ForeignSourceController'
    })
    .when('/requisitions/:foreignSource/nodes/:foreignId', {
      templateUrl: require('ngtemplate!./views/node.html'),
      controller: 'NodeController'
    })
    .when('/requisitions/:foreignSource/nodes/:foreignId/vertical', {
      templateUrl: require('ngtemplate!./views/node-panels.html'),
      controller: 'NodeController'
    })
    .otherwise({
      redirectTo: '/requisitions'
    });
  }])

  .config(['growlProvider', function(growlProvider) {
    growlProvider.globalTimeToLive(3000);
    growlProvider.globalPosition('bottom-center');
  }])

  .config(['$uibTooltipProvider', function($uibTooltipProvider) {
    $uibTooltipProvider.setTriggers({
      'mouseenter': 'mouseleave'
    });
    $uibTooltipProvider.options({
      'placement': 'left',
      'trigger': 'mouseenter'
    });
  }]);

}());
