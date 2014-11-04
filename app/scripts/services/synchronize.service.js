/**
* @author Alejandro Galue <agalue@opennms.org>
* @copyright 2014 The OpenNMS Group, Inc.
*/

(function() {

  'use strict';

  angular.module('onms-requisitions')

  /**
  * @ngdoc service
  * @name SynchronizeService
  * @module onms-requisitions
  */
  .factory('SynchronizeService', ['RequisitionsService', 'growl', function(RequisitionsService, growl) {  
    return {
      /**
      * @description Requests the synchronization/import of a requisition on the server
      *
      * A dialog box is displayed to request to the user if the scan phase should be triggered or not.
      *
      * @name RequisitionsController:synchronize
      * @ngdoc method
      * @methodOf RequisitionsController
      * @param {string} foreignSource The name of the requisition
      */
      synchronize: function(foreignSource, errorHandler) {
        var doSynchronize = function(foreignSource, rescanExisting) {
          RequisitionsService.synchronizeRequisition(foreignSource, rescanExisting).then(
            function() { // success
              growl.addSuccessMessage('The import operation has been started for ' + foreignSource + ' (rescanExisting? ' + rescanExisting + ')');
            },
            errorHandler
          );
        };
        bootbox.dialog({
          message: 'Do you want to rescan existing nodes ?',
          title: 'Synchronize Requisition ' + foreignSource,
          buttons: {
            success: {
              label: 'Yes',
              className: 'btn-success',
              callback: function() {
                doSynchronize(foreignSource, 'true');
              }
            },
            warning: {
              label: 'DB Only',
              className: 'btn-warning',
              callback: function() {
                doSynchronize(foreignSource, 'dbonly');
              }
            },
            danger: {
              label: 'No',
              className: 'btn-danger',
              callback: function() {
                doSynchronize(foreignSource, 'false');
              }
            },
            main: {
              label: 'Cancel',
              className: 'btn-default'
            }
          }
        });
      }
    };
  }]);

}());

