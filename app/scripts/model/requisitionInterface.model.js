/**
* @ngdoc object
* @name RequisitionInterface
* @param {Object} intf an OpenNMS interface JSON object
* @constructor
*/
function RequisitionInterface(intf) {
  'use strict';

  var self = this;

  self.ipAddress = intf['ip-addr'];
  self.description = intf['descr'];
  self.snmpPrimary = intf['snmp-primary'];
  self.status = intf['status'] === '1' ? 'managed' : 'unmanaged';
  self.services = [];

  angular.forEach(intf['monitored-service'], function(svc) {
    self.services.push({ name: svc['service-name'] });
  });

  self.addNewService = function() {
    self.services.push({ name: '' });
    return self.services.length - 1;
  };

  self.className = 'RequisitionInterface';

  return self;
}