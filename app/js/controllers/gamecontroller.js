'use strict'

angular.module('Tribetron').controller('GameController', ['$scope', '$interval', 'AreaMap', 'Robot', 'Team', 'GameHandler', 'BattleLog', function($scope, $interval, AreaMap, Robot, Team, GameHandler, BattleLog) {

	$scope.gameStarted = false
	
	$scope.battleLog = BattleLog.getLog()
	
	function init() {
		$scope.battleLog.reset()
		$scope.battleLog.add("Battle started")
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
		
		var width = 15, height = 10, robotsPerTeam = 8, numberOfRounds = 25
		$scope.autoPlayOn = undefined
		$scope.playToggle = 'Play'
		
		$scope.map = AreaMap.createMap(width,height)
		
		$scope.team = createTeamWithRobots('Corobons', robotsPerTeam)
		$scope.enemyTeam = createTeamWithRobots('Tributrons', robotsPerTeam, true)
		
		$scope.teams = [$scope.team, $scope.enemyTeam]
		
		placeTeam($scope.team)
		placeTeam($scope.enemyTeam)
		
		$scope.gameState = GameHandler.createGameState([$scope.team, $scope.enemyTeam], numberOfRounds)
	}
	
	$scope.nextTurn = function() {
		$scope.stop()
		if (!$scope.gameState.isOver()) {
			$scope.gameState.nextRobot().takeTurn($scope.map)
			angular.forEach($scope.teams, function(team) { team.updateBotCount() })
		}
	}
	
	$scope.fullTurn = function() {
		$scope.stop()
		var round = $scope.gameState.round
		while(!$scope.gameState.isOver() && $scope.gameState.round === round) { 
			$scope.nextTurn()
		}
	}
	
	$scope.winMessage = function() {
		var winningTeam = $scope.gameState ? $scope.gameState.getWinner() : undefined
		return winningTeam ? winningTeam.name + ' are victorious!' : 'Battle ended in a draw'
	}
	
	$scope.newGame = function() {
		$scope.gameStarted = true
		$scope.stop()
		init()
	}
	
	$scope.play = function() {
		$scope.autoPlayOn = $interval(function() {
            if (!$scope.gameState.isOver()) {
              $scope.gameState.nextRobot().takeTurn($scope.map)
			  angular.forEach($scope.teams, function(team) { team.updateBotCount() })
            } else {
              $scope.stop();
            }
          }, 150);
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