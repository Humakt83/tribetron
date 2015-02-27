'use strict'

angular.module('Tribetron').controller('GameController', ['$scope', '$interval', 'AreaMap', 'Robot', 'Team', 'GameHandler', function($scope, $interval, AreaMap, Robot, Team, GameHandler) {
	function init() {
		var createTeamWithRobots = function(amountOfRobots, isEnemy) {
			var bots = []
			for ( var i = 0; i < amountOfRobots; i++) {
				var robotType = Robot.getTypes()[Math.floor(Math.random() * Robot.getTypes().length)]
				bots.push(Robot.createRobot(new robotType()))
			}
			return Team.createTeam(bots, isEnemy)
		}
		
		var placeTeam = function(team) {
			angular.forEach(team.robots, function(robot) {
				$scope.map.placeRobotAtRandomFreeSpot(robot, team.isEnemy)
			})
		}
		
		var width = 15, height = 10, robotsPerTeam = 8, numberOfRounds = 25
		$scope.autoPlayOn = undefined
		$scope.playToggle = 'Play'
		
		$scope.map = AreaMap.createMap(width,height)
		
		$scope.team = createTeamWithRobots(robotsPerTeam)
		$scope.enemyTeam = createTeamWithRobots(robotsPerTeam, true)
		
		placeTeam($scope.team)
		placeTeam($scope.enemyTeam)
		
		$scope.gameState = GameHandler.createGameState([$scope.team, $scope.enemyTeam], numberOfRounds)
	}
	
	$scope.title = 'Tribetron'
	
	$scope.nextTurn = function() {
		$scope.stop()
		if (!$scope.gameState.isOver()) {
			$scope.gameState.nextRobot().takeTurn($scope.map)
		}
	}
	
	$scope.fullTurn = function() {
		$scope.stop()
		var round = $scope.gameState.round
		while(!$scope.gameState.isOver() && $scope.gameState.round === round) { 
			$scope.nextTurn()
		}
	}
	
	$scope.newGame = function() {
		$scope.stop()
		init()
	}
	
	$scope.play = function() {
		$scope.autoPlayOn = $interval(function() {
            if (!$scope.gameState.isOver()) {
              $scope.gameState.nextRobot().takeTurn($scope.map)
            } else {
              $scope.stop();
            }
          }, 100);
		  $scope.playToggle = 'Pause' 
	}
	
	$scope.togglePlay = function() {
		if ($scope.autoPlayOn) $scope.stop()
		else $scope.play()
		
	}
	
	$scope.stop = function() {
		if (!$scope.autoPlayOn) return
		$interval.cancel($scope.autoPlayOn)
		$scope.autoPlayOn = undefined
		$scope.playToggle = 'Play' 
	}
}])