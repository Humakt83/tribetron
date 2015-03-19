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
	$scope.randomWalls = 5
	
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
		var placeRandomWalls = function(randomWalls) {
			for (var i = 0; i < randomWalls; i++) {
				var x = 1 + Math.floor(Math.random() * ($scope.map.width - 2))
				var y = 1 + Math.floor(Math.random() * ($scope.map.height - 2))
				$scope.map.getAreaByCoord(AreaMap.createCoord(x, y)).isWall = true
			}
		}
		var numberOfRounds = 25
		$scope.autoPlayOn = undefined
		$scope.playToggle = 'Play'
		
		$scope.map = AreaMap.createMap($scope.mapWidth, $scope.mapHeight)
		placeRandomWalls($scope.randomWalls)
		
		$scope.team = createTeamWithRobots('Corobons', $scope.botsPerTeam)
		$scope.enemyTeam = createTeamWithRobots('Tributrons', $scope.botsPerTeam, true)
		
		$scope.teams = [$scope.team, $scope.enemyTeam]
		
		placeTeam($scope.team)
		placeTeam($scope.enemyTeam)
		
		placeTraps($scope.trapAmount)
		
		$scope.gameState = GameHandler.createGameState([$scope.team, $scope.enemyTeam], numberOfRounds)
	}
	
	function validateOptions() {
		var areaSpace = ($scope.mapWidth - 4) * ($scope.mapHeight - 2)
		$scope.invalidArguments = areaSpace < ($scope.botsPerTeam * 2) + $scope.trapAmount ? 'Map is too small for robots and traps. ': ''
		$scope.invalidArguments += $scope.randomWalls >= $scope.mapWidth - 2 || $scope.randomWalls >= $scope.mapHeight - 2 ? 'Too many walls.' : ''
		return $scope.invalidArguments.length < 1
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
		if (!validateOptions()) return
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