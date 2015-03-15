'use strict';
angular.module('Tribetron').directive('numberPicker', [function() {

	return {
		restrict: 'E',
		scope: {
			'value': '=',
			'min': '@',
			'max': '@',
			'step': '@'
		},
		link: function($scope, element) {

			var opts = ({
				min: Number($scope.min),
				max: Number($scope.max),
				step: Number($scope.step)
			});

			$scope.$watch('value', function(newValue) {
				$scope.canDown = newValue > opts.min;
				$scope.canUp = newValue < opts.max;
			});

			var changeNumber = function($event) {
				var type = angular.element($event.target).attr('type');
				if ('up' === type && $scope.value < opts.max) {
					$scope.value += opts.step;
				} else if ('down' === type && $scope.value > opts.min) {
					$scope.value -= opts.step
				}
			};

			element.find('span').on('click', function(e) {
				changeNumber(e);
				$scope.$apply();
			});


		},
		template: '<div class="input-group"><span class="input-group-addon" type="down" ng-disabled="!canDown">-</span><label class="form-control">{{ value }}</label><span class="input-group-addon" type="up" ng-disabled="!canUp">+</span></div>'
	};
 }]);