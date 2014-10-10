/**
* @author Alejandro Galue <agalue@opennms.org>
* @copyright 2014 The OpenNMS Group, Inc.
*/

(function() {

  'use strict';

  angular.module('onms-requisitions')

  /**
  * @ngdoc controller
  * @name DetectorController
  * @module onms-requisitions
  *
  * @requires $scope Angular local scope
  * @requires $modalInstance Angular modal instance
  * @requires detector Requisition detector object
  *
  * @description The controller for manage the modal dialog for add/edit requisition detectors
  */
  .controller('DetectorController', ['$scope', '$modalInstance', 'detector', function($scope, $modalInstance, detector) {

    /**
     * @description The detector object
     *
     * @ngdoc property
     * @name DetectorController#detector
     * @propertyOf DetectorController
     * @returns {object} The detector object
     */
    $scope.detector = detector;

    /**
    * @description Saves the current detector
    *
    * @name DetectorController:save
    * @ngdoc method
    * @methodOf DetectorController
    */
    $scope.save = function () {
      $modalInstance.close($scope.detector);
    };

    /**
    * @description Cancels the current operation
    *
    * @name DetectorController:cancel
    * @ngdoc method
    * @methodOf DetectorController
    */
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    /**
    * @description Adds a new empty parameter to the current detector
    *
    * @name DetectorController:addParameter
    * @ngdoc method
    * @methodOf DetectorController
    */
    $scope.addParameter = function() {
      $scope.detector.parameter.push({ 'key': '', 'value': '' });
    };

    /**
    * @description Removes a parameter from the current detector
    *
    * @name DetectorController:removeParameter
    * @ngdoc method
    * @methodOf DetectorController
    * @param {integer} index The index of the parameter to remove
    */
    $scope.removeParameter = function(index) {
      $scope.detector.parameter.splice(index, 1);
    };

  }]);

}());
