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

  self.requisitions = [];

  self.indexOf = function(foreignSource) {
    for(var i = 0; i < this.requisitions.length; i++) {
      if (this.requisitions[i].foreignSource === foreignSource) {
        return i;
      }
    }
    return -1;
  };

  self.className = 'RequisitionsData';

  return self;
}
