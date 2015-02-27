'use strict'

angular.module('Tribetron').controller('GameController', ['$scope', 'AreaMap', 'Robot', 'Team', 'GameHandler', function($scope, AreaMap, Robot, Team, GameHandler) {
	var createTeamWithRobots = function(amountOfRobots, isEnemy) {
		var bots = []
		var robotType = Robot.getTypes()[0]
		for ( var i = 0; i < amountOfRobots; i++) {
			bots.push(Robot.createRobot(robotType))
		}
		return Team.createTeam(bots, isEnemy)
	}
	
	var placeTeam = function(team) {
		angular.forEach(team.robots, function(robot) {
			$scope.map.placeRobotAtRandomFreeSpot(robot, team.isEnemy)
		})
	}
	
	var width = 10, height = 10, robotsPerTeam = 5
	
	$scope.map = AreaMap.createMap(width,height)
	
	$scope.team = createTeamWithRobots(robotsPerTeam)
	$scope.enemyTeam = createTeamWithRobots(robotsPerTeam, true)
	
	placeTeam($scope.team)
	placeTeam($scope.enemyTeam)
	
	$scope.gameState = GameHandler.createGameState([$scope.team, $scope.enemyTeam], 20)
	$scope.title = 'Tribetron'
	
	$scope.nextTurn = function() {
		if (!$scope.gameState.isOver()) {
			$scope.gameState.nextRobot().takeTurn($scope.map)
		}
	}
	
	$scope.fullTurn = function() {
		var round = $scope.gameState.round
		while(!$scope.gameState.isOver() && $scope.gameState.round === round) { 
			$scope.nextTurn()
		}
	}
}])