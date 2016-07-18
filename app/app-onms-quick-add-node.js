/* eslint no-undef:off */

/**
* @author Alejandro Galue <agalue@opennms.org>
* @copyright 2014 The OpenNMS Group, Inc.
*/

(function() {
  'use strict';

  var angular = require('angular');

  // CSS
  require('bootstrap/dist/css/bootstrap.css');
  require('bootstrap/dist/css/bootstrap-theme.css');
  require('angular-loading-bar/build/loading-bar.css');
  require('angular-growl-v2/build/angular-growl.css');

  // Load Libraries and Extensions
  require('angular-route');
  require('angular-cookies');
  require('angular-sanitize');
  require('angular-animate');
  require('angular-ui-bootstrap');
  require('angular-loading-bar');
  require('angular-growl-v2');
  require('ip-address');
  require('bootbox');
  require('bootstrap');

  var quickAddNodeTemplate = require('./views/quick-add-node-standalone.html');

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
    .when('/', {
      templateUrl: quickAddNodeTemplate,
      controller: 'QuickAddNodeController',
      resolve: {
        foreignSources: function() { return null; }
      }
    })
    .otherwise({
      redirectTo: '/'
    });
  }])

  .config(['growlProvider', function(growlProvider) {
    growlProvider.globalTimeToLive(3000);
    growlProvider.globalPosition('bottom-center');
  }]);

  // Load Directives and Filters
  require('./scripts/directives/requisitionConstraints.js');

  // Load Application Services
  require('./scripts/services/Requisitions.js');
  require('./scripts/services/Synchronize.js');

  // Load Application Controllers
  require('./scripts/controllers/QuickAddNode.js');
  require('./scripts/controllers/QuickAddNodeModal.js');

  // Trigger AngularJS
  document.addEventListener('DOMContentLoaded', function() {
    angular.bootstrap(document, ['onms-requisitions']);
  }, false);

}());
