'use strict'

angular.module('Tribetron').controller('CustomBattleController', ['$scope', '$interval', '$location', 'AreaMap', 'Robot', 'Trap', 'Team', 'GameHandler', 'Player', 'Campaign', 'GameSettings', 'InfoOpener', 'Abilities',       'AI', function($scope, $interval, $location, AreaMap, Robot, Trap, Team, GameHandler, Player, Campaign, GameSettings, InfoOpener, Abilities, AI) {

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
				
		var placeTeam = function(team) {
			angular.forEach(team.robots, function(robot) {
				$scope.map.placeRobotAtRandomFreeSpot(robot, team.isEnemy)
			})
		}
		
		var addBotToMap = function(objectName, area) {
			var botType = _.find(Robot.getTypesAsObjects(), function(type) {
					return type.typeName == objectName;
			})
			if (botType) {
				var bot = Robot.createRobot(botType)
				$scope.enemyTeam.addBot(bot)
				area.setRobot(bot)
			}
		}
		
		var addTrapToMap = function(objectName, area) {
			var trapType = _.find(Trap.getTrapTypes(), function(Type) {
				return new Type().jsonName == objectName
			})
			if (trapType) {
				area.setTrap(Trap.createTrap(trapType))
			}
		}
		
		$scope.team = $scope.player.team
		
		var scenario = Campaign.getCampaign().loadedScenario
        var width = scenario.rows[0].length, height = scenario.rows.length
        var robotsPerTeam = scenario.maxRoster, numberOfRounds = scenario.rounds
        $scope.opponent = AI.createOpponent(AI.getOpponentByName(scenario.opponent))
        $scope.reward = scenario.reward
        $scope.autoPlayOn = undefined

        $scope.map = AreaMap.createMap(width,height)

        $scope.enemyTeam = Team.createTeam(scenario.opponentTeamName, [], true)
        for (var y = 0; y < height; y++) {
            var rowAreas = $scope.map.getAreasByRow(y)
            for (var x = 0; x < width; x++) {
                var objectName = scenario.rows[y][x].object
                if (objectName == 'wall') {
                    rowAreas[x].isWall = true
                } else {
                    rowAreas[x].isWall = false
                    addBotToMap(objectName, rowAreas[x])
                    addTrapToMap(objectName, rowAreas[x])
                }
            }
        }

        $scope.teams = [$scope.team, $scope.enemyTeam]

        if (!$scope.player.tactics) {
            placeTeam($scope.team)
        } else {
            $scope.botsToPlaceRandomly = _.chain($scope.team.robots).filter(function(bot) {
                return bot.type.unplaceable
            }).value()
            if ($scope.botsToPlaceRandomly.length === $scope.team.robots.length) {
                placeTeam($scope.team)
            } else {
                $scope.botsToPlace = _.chain($scope.team.robots).filter(function(bot) {
                    return !_.contains($scope.botsToPlaceRandomly, bot)
                }).value()
                $scope.tacticsPhase = true
                $scope.botToPlace = 0
            }
        }

        $scope.gameState = GameHandler.createGameState([$scope.team, $scope.enemyTeam], numberOfRounds)

        $scope.opponentTaunt = $scope.opponent.type.helloMessage
		
	}

	$scope.placeBot = function(area) {
		if (area.isEmpty() && area.xCoord < ($scope.map.width / 2) -1) {
			area.setRobot($scope.botsToPlace[$scope.botToPlace])
			$scope.botToPlace++
			$scope.tacticsPhase = $scope.botsToPlace[$scope.botToPlace] !== undefined
			if (!$scope.tacticsPhase) {
				_.each($scope.botsToPlaceRandomly, function(bot) {
					$scope.map.placeRobotAtRandomFreeSpot(bot, false)
				})
			}
		}
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
		if ($scope.tacticsPhase) {
			$scope.placeBot(area)
			return
		}
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