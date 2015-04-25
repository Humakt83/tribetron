'use strict'

angular.module('Tribetron').controller('BattleController', ['$scope', '$interval', '$location', 'AreaMap', 'Robot', 'Trap', 'Team', 'GameHandler', 'Player', 'Campaign', 'GameSettings', 'InfoOpener', 'Abilities', 'AI', 
		function($scope, $interval, $location, AreaMap, Robot, Trap, Team, GameHandler, Player, Campaign, GameSettings, InfoOpener, Abilities, AI) {
	
	$scope.player = Player.getPlayer()
	
	if (!$scope.player) {
		$location.path('/')
		return
	}
	
	$scope.settings = GameSettings
	$scope.infoOpener = InfoOpener
	Abilities.reset()
	$scope.abilities = Abilities.getAbilities()
	$scope.action = undefined
	
	
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
		
		var placeTraps = function(traps) {
			angular.forEach(traps, function(trap) {
				var trapType = _.find(Trap.getTrapTypes(), function(type) {
						return new type().name === trap;
				})
				$scope.map.placeTrapAtRandomFreeSpot(Trap.createTrap(trapType))
			})			
		}
		
		$scope.team = $scope.player.team
		
		Campaign.getScenario(Campaign.getCampaign().currentScenario).success(function(result) {
			var width = result.areaWidth, height = result.areaHeight, robotsPerTeam = result.maxRoster, numberOfRounds = result.rounds
			var traps = result.traps ? result.traps : []
			$scope.opponent = AI.createOpponent(AI.getOpponentByName(result.opponent))
			$scope.autoPlayOn = undefined
			$scope.playToggle = 'Play'
			$scope.reward = result.reward
			
			$scope.map = AreaMap.createMap(width,height)
			
			
			$scope.enemyTeam = createTeamWithRobots(result.opponentTeamName, robotsPerTeam, result.rosterOpponent)
			
			$scope.teams = [$scope.team, $scope.enemyTeam]
			
			placeTeam($scope.team)
			placeTeam($scope.enemyTeam)
			
			placeTraps(traps)
			
			$scope.gameState = GameHandler.createGameState([$scope.team, $scope.enemyTeam], numberOfRounds)
			
			$scope.opponentTaunt = $scope.opponent.type.helloMessage
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
		$scope.waitingForPlayerTurn = true
		var round = $scope.gameState.round
		$scope.autoPlayOn = $interval(function() {
            if (!$scope.gameState.isOver() && $scope.gameState.round == round) {
              $scope.gameState.nextRobot().takeTurn($scope.map)
			  angular.forEach($scope.teams, function(team) { team.updateBotCount() })
            } else {
              $scope.stop();
            }
          }, 100 * GameSettings.getGameSpeed());
	}
	
	$scope.stop = function() {
		if (!$scope.autoPlayOn) return
		$interval.cancel($scope.autoPlayOn)
		$scope.autoPlayOn = undefined
		$scope.waitingForPlayerTurn = false
	}
	
	$scope.continueGame = function() {
		$scope.player.money = $scope.player.money + $scope.reward
		$scope.player.team.removeBotsByTypeName('multiplicator')
		angular.forEach($scope.team.destroyedBots(), function(bot) { $scope.team.removeBot(bot) })
		angular.forEach($scope.team.robots, function(bot) {
			if (bot.hacked) $scope.team.removeBot(bot)
			else bot.cleanEffects()
		})
		$location.path('/game')
	}
	
	$scope.backToMain = function() {
		$location.path('/')
	}
	
	$scope.pickAction = function(action) {
		if ($scope.action && $scope.action.selectedBot) $scope.action.selectedBot = undefined
		$scope.action = action
	}
	
	$scope.actionPossible = function(area) {
		if ($scope.waitingForPlayerTurn || !$scope.action || $scope.gameState.isOver()) return false
		var actionPossible
		switch ($scope.action.name) {
			case 'Repair': 
				actionPossible = area.robot && !area.robot.destroyed && area.robot.currentHealth < area.robot.type.maxHealth
				break
			case 'Attack': 
				actionPossible = area.robot && !area.robot.destroyed
				break
			case 'Teleport':
				actionPossible = (area.robot && !$scope.action.selectedBot && !area.robot.type.cannotBeTeleported) || ($scope.action.selectedBot && area.isEmpty())
				break;
			case 'Stun':
				actionPossible = area.robot && !area.robot.destroyed
				break;
			default:
				actionPossible = false
		}
		return $scope.action.cooldownLeft > 0 ? false : actionPossible;
	}
	
	$scope.doAction = function(area) {
		if (!$scope.actionPossible(area)) return
		if ($scope.action.activate($scope.player.name, area.robot, $scope.map, area) && !$scope.gameState.isOver()) {
			$scope.opponentTaunt = $scope.opponent.playTurn($scope.enemyTeam, $scope.map)
			Abilities.reduceCooldowns()
			$scope.play()
		}
	}
	
	if (Team.getPlayerTeam()) init()
	else $scope.continueGame()
}])