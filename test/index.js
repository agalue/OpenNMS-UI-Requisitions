// This file is an entry point for angular tests
// Avoids some weird issues when using webpack + angular.

require('angular');
require('angular-mocks/angular-mocks');

var testsContext = require.context(".", true, /.js$/);
testsContext.keys().forEach(testsContext);
