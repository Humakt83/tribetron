'use strict'

angular.module('Tribetron').controller('MainController', ['$scope', '$location', 'Player', function($scope, $location, Player) {

	$scope.newCampaign = function() {
		Player.reset()
		$location.path('/game')
	}

	$scope.newRumble = function() {
		$location.path('/rumble')
	}
	
	$scope.help = function() {
		alert('This is help')
	}


}])