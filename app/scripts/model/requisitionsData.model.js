/**
* @ngdoc object
* @name RequisitionsData
* @constructor
*/
function RequisitionsData() {

  'use strict';

  var self = this;

  self.status = {
    deployed: 0,
    pending: 0
  };

  self.requisitions = {};

  self.requisitionsCount = function() {
    var count = 0;
    for (var key in this.requisitions) {
      if (this.requisitions.hasOwnProperty(key)) {
        count++;
      }
    }
    return count;
  };

  self.className = 'RequisitionsData';

  return self;
}