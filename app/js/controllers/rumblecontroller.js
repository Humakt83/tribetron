'use strict'

angular.module('Tribetron').controller('RumbleController', ['$scope', '$interval', 'AreaMap', 'Robot', 'Trap', 'Team', 'GameHandler', 'BattleLog', 'GameSettings',
		function($scope, $interval, AreaMap, Robot, Trap, Team, GameHandler, BattleLog, GameSettings) {

	$scope.gameStarted = false
	
	$scope.settings = GameSettings
	
	$scope.battleLog = BattleLog.getLog()
	
	$scope.mapWidth = 15
	$scope.mapHeight = 10
	$scope.trapAmount = 5
	$scope.botsPerTeam = 8
	
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
		
		var placeTraps = function(amountOfTraps) {
			for (var i = 0; i < amountOfTraps; i++) {
				var trapType = Trap.getTrapTypes()[Math.floor(Math.random() * Trap.getTrapTypes().length)]
				$scope.map.placeTrapAtRandomFreeSpot(Trap.createTrap(trapType))
			}
		}
		var numberOfRounds = 25
		$scope.autoPlayOn = undefined
		$scope.playToggle = 'Play'
		
		$scope.map = AreaMap.createMap($scope.mapWidth, $scope.mapHeight)
		
		$scope.team = createTeamWithRobots('Corobons', $scope.botsPerTeam)
		$scope.enemyTeam = createTeamWithRobots('Tributrons', $scope.botsPerTeam, true)
		
		$scope.teams = [$scope.team, $scope.enemyTeam]
		
		placeTeam($scope.team)
		placeTeam($scope.enemyTeam)
		
		placeTraps($scope.trapAmount)
		
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
              $scope.stop($scope.continuousPlay)
            }
          }, 100 * GameSettings.getGameSpeed());
		 $scope.playToggle = 'Pause' 
	}
	
	$scope.togglePlay = function() {
		if ($scope.autoPlayOn) $scope.stop()
		else $scope.play()
		
	}
	
	$scope.stop = function(restart) {
		if (!$scope.autoPlayOn) return
		$interval.cancel($scope.autoPlayOn)
		$scope.autoPlayOn = undefined
		$scope.playToggle = 'Play' 
		if (restart) {
			$scope.newGame()
			$scope.play()
		}
	}
}])