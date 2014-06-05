(function() {

  'use strict';

  angular.module('onms-requisitions')

  .filter('startFrom', function() {
    return function(input, start) {
      start = +start; // convert it to integer
      if (input) {
        return input.length < start ? input : input.slice(start);
      }
      return [];
    }
  });

}());