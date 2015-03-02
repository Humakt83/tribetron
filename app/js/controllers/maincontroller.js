'use strict'

angular.module('Tribetron').controller('MainController', ['$scope', '$location', function($scope, $location) {

	$scope.newCampaign = function() {
		$location.path('/game')
	}

	$scope.newRumble = function() {
		$location.path('/rumble')
	}
	
	$scope.help = function() {
		alert('This is help')
	}


}])