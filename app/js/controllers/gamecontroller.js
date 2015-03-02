'use strict'

angular.module('Tribetron').controller('GameController', ['$scope', 'AreaMap', 'Robot', 'Team', 'GameHandler', function($scope, AreaMap, Robot, Team, GameHandler) {

	$scope.gameStarted = false
	
	function init() {

	}
	
	$scope.newGame = function() {
		$scope.gameStarted = true
		$scope.stop()
		init()
	}
}])