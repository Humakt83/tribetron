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
	
	$scope.gameState = GameHandler.createGameState([$scope.team, $scope.enemyTeam])
	$scope.title = 'Tribetron'
	
	$scope.nextTurn = function() {
		var bot = $scope.gameState.nextRobot()
		bot.takeTurn($scope.map)
	}
	
	$scope.fullTurn = function() {
		$scope.nextTurn()
		while($scope.gameState.robotTurn !== 0) { 
			$scope.nextTurn()
		}
	}
}])