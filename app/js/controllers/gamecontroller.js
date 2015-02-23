'use strict'

angular.module('Tribetron').controller('GameController', ['$scope', 'AreaMap', 'Robot', function($scope, AreaMap, Robot) {
	var width = 10, height = 10, robots = 10
	
	$scope.map = AreaMap.createMap(width,height)
	
	var robotType = Robot.getTypes()[0]
	
	for ( var i = 0; i < robots; i++) {
		$scope.map.placeRobotAtRandomFreeSpot(Robot.createRobot(robotType))
	}
	
	$scope.title = 'Tribetron'
}])