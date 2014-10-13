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
  * @requires RequisitionsService The Requisitions Servive
  * @requires detector Requisition detector object
  *
  * @description The controller for manage the modal dialog for add/edit requisition detectors
  */
  .controller('DetectorController', ['$scope', '$modalInstance', 'RequisitionsService', 'detector', function($scope, $modalInstance, RequisitionsService, detector) {

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
     * @description The available detectors object
     *
     * @ngdoc property
     * @name DetectorController#availableDetectors
     * @propertyOf DetectorController
     * @returns {array} The detectors list
     */
    $scope.availableDetectors = [];

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

    /**
    * @description Sets the detector class for a given detector name if exist;
    * otherwise, set the class to be null.
    *
    * @name DetectorController:setClassForName
    * @ngdoc method
    * @methodOf DetectorController
    * @param {object} selectedDetector the detector to be used as a reference
    */
    $scope.setClassForName = function(selectedDetector) {
      for (var i=0; i < $scope.availableDetectors.length; i++) {
        var detector = $scope.availableDetectors[i];
        if (detector.name == selectedDetector.name) {
          $scope.detector.class = detector.class;
          return;
        }
      }
      $scope.detector.class = null;
    };

    /**
    * @description Sets the detector name for a given detector class if exist only if the name is not set.
    * otherwise, leavs the detector name unchanged.
    *
    * @name DetectorController:setNameForClass
    * @ngdoc method
    * @methodOf DetectorController
    * @param {object} selectedDetector the detector to be used as a reference
    */
    $scope.setNameForClass = function(selectedDetector) {
      for (var i=0; i < $scope.availableDetectors.length; i++) {
        var detector = $scope.availableDetectors[i];
        if (detector.class == selectedDetector.class && !$scope.detector.name) {
          $scope.detector.name = detector.name;
        }
      }
    };

    // Initialize
    RequisitionsService.getAvailableDetectors().then(function(detectors) {
      $scope.availableDetectors = detectors;
    });

  }]);

}());
