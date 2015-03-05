'use strict'

angular.module('Tribetron').controller('BattleController', ['$scope', '$interval', '$location', 'AreaMap', 'Robot', 'Team', 'GameHandler', 'Player', 'Campaign', function($scope, $interval, $location, AreaMap, Robot, Team, GameHandler, Player, Campaign) {
	
	$scope.player = Player.getPlayer()
	
	if (!$scope.player) {
		$location.path('/')
		return
	}
	
	function init() {
		var createTeamWithRobots = function(teamName, amountOfRobots, rosterOpponent) {
			function createRandomRobot() {
				var robotType = Robot.getTypes()[Math.floor(Math.random() * Robot.getTypes().length)]
				return Robot.createRobot(new robotType())
			}
			var bots = []
			angular.forEach(rosterOpponent, function(botType) {
				if (botType != 'unknown') {
					bots.push(Robot.createRobot(_.find(Robot.getTypesAsObjects(), function(type) {
						return type.typeName === botType;
					})))
				} else {
					bots.push(createRandomRobot())
				}
			})
			return Team.createTeam(teamName, bots, true)
		}
		
		var placeTeam = function(team) {
			angular.forEach(team.robots, function(robot) {
				$scope.map.placeRobotAtRandomFreeSpot(robot, team.isEnemy)
			})
		}
		
		$scope.team = $scope.player.team
		
		Campaign.getScenario(Campaign.getCampaign().currentScenario).success(function(result) {
			var width = result.areaWidth, height = result.areaHeight, robotsPerTeam = result.maxRoster, numberOfRounds = result.rounds
			$scope.autoPlayOn = undefined
			$scope.playToggle = 'Play'
			$scope.reward = result.reward
			
			$scope.map = AreaMap.createMap(width,height)
			
			
			$scope.enemyTeam = createTeamWithRobots(result.opponentTeamName, robotsPerTeam, result.rosterOpponent)
			
			$scope.teams = [$scope.team, $scope.enemyTeam]
			
			placeTeam($scope.team)
			placeTeam($scope.enemyTeam)
			
			$scope.gameState = GameHandler.createGameState([$scope.team, $scope.enemyTeam], numberOfRounds)
		})
	}
	
	$scope.winMessage = function() {
		var winningTeam = $scope.gameState ? $scope.gameState.getWinner() : undefined
		var winMessage = winningTeam ? winningTeam.name + ' are victorious!' : 'Battle ended in a draw.'
		if (winningTeam === $scope.team) {
			$scope.victorious = true
			winMessage += '\n' + $scope.player.name + ' earned reward of ' + $scope.reward + ' tribs.'
		} else {
			$scope.victorious = false
			winMessage +='\n' + $scope.player.name + ' has been defeated from campaign.'
		}
		return winMessage
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
		$scope.player.money = $scope.player.money + $scope.reward
		$scope.player.team.removeBotsByTypeName('multiplicator')
		angular.forEach($scope.team.destroyedBots(), function(bot) { $scope.team.removeBot(bot) })
		$location.path('/game')
	}
	
	$scope.backToMain = function() {
		$location.path('/')
	}
	
	if (Team.getPlayerTeam()) init()
	else $scope.continueGame()
}])