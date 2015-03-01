'use strict'

angular.module('Tribetron').controller('BattleController', ['$scope', '$interval', '$location', 'AreaMap', 'Robot', 'Team', 'GameHandler', function($scope, $interval, $location, AreaMap, Robot, Team, GameHandler) {
	
	function init() {
		var createTeamWithRobots = function(teamName, amountOfRobots, isEnemy) {
			var bots = []
			for ( var i = 0; i < amountOfRobots; i++) {
				var robotType = Robot.getTypes()[Math.floor(Math.random() * Robot.getTypes().length)]
				bots.push(Robot.createRobot(new robotType()))
			}
			return Team.createTeam(teamName, bots, isEnemy)
		}
		
		var placeTeam = function(team) {
			angular.forEach(team.robots, function(robot) {
				$scope.map.placeRobotAtRandomFreeSpot(robot, team.isEnemy)
			})
		}
		
		$scope.team = Team.getPlayerTeam()
		
		var width = 15, height = 10, robotsPerTeam = $scope.team.robots.length, numberOfRounds = 25
		$scope.autoPlayOn = undefined
		$scope.playToggle = 'Play'
		
		$scope.map = AreaMap.createMap(width,height)
		
		
		$scope.enemyTeam = createTeamWithRobots('Tributrons', robotsPerTeam, true)
		
		$scope.teams = [$scope.team, $scope.enemyTeam]
		
		placeTeam($scope.team)
		placeTeam($scope.enemyTeam)
		
		$scope.gameState = GameHandler.createGameState([$scope.team, $scope.enemyTeam], numberOfRounds)
	}
	
	$scope.winMessage = function() {
		var winningTeam = $scope.gameState ? $scope.gameState.getWinner() : undefined
		return winningTeam ? winningTeam.name + ' are victorious!' : 'Battle ended in a draw'
	}
	
	$scope.play = function() {
		$scope.autoPlayOn = $interval(function() {
            if (!$scope.gameState.isOver()) {
              $scope.gameState.nextRobot().takeTurn($scope.map)
			  angular.forEach($scope.teams, function(team) { team.updateBotCount() })
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
	
	$scope.continueGame = function() {
		$location.path('/shop')
	}
	
	if (Team.getPlayerTeam()) init()
	else $scope.continueGame()
}])