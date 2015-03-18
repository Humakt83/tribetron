'use strict'

angular.module('Tribetron').controller('VentureController', ['$scope', '$interval', '$location', 'AreaMap', 'Robot', 'Trap', 'Team', 'GameHandler', 'GameSettings', 'Campaign', 'Player', 'Loot',
		function($scope, $interval, $location, AreaMap, Robot, Trap, Team, GameHandler, GameSettings, Campaign, Player, Loot) {
	
	$scope.player = Player.getPlayer()
	
	if (!$scope.player) {
		$location.path('/')
		return
	}
	
	$scope.settings = GameSettings

	
	function init() {
		var addBotToMap = function(objectName, area) {
			var botType = _.find(Robot.getTypesAsObjects(), function(type) {
					return type.typeName == objectName;
			})
			if (botType) {
				var bot = Robot.createRobot(botType)
				$scope.monsters.addBot(bot)
				area.setRobot(bot)
			}
			
		}
		
		var addTrapToMap = function(objectName, area) {
			var trapType = _.find(Trap.getTrapTypes(), function(type) {
				return new type().jsonName == objectName
			})
			if (trapType) {
				area.setTrap(Trap.createTrap(trapType))
			}
		}
		
		var addPlayerToMap = function(objectName, area) {
			if (objectName == 'player') {
				area.setRobot($scope.player.avatar)
			}
		}
		
		var addLootToMap = function(objectName, area) {
			var loot = _.find(Loot.getLootTypesAsObjects(), function(type) {
				return type.cssName == objectName
			})
			if (loot) {
				area.setLoot(loot)
			}
		}
		
		Campaign.getScenario(Campaign.getCampaign().currentScenario).success(function(result) {
			var width = result.rows[0].length, height = result.rows.length
			
			$scope.map = AreaMap.createMap(width,height)
			
			$scope.monsters = Team.createTeam('enemy', [], true)
			
			for (var y = 0; y < height; y++) {
				var rowAreas = $scope.map.getAreasByRow(y)
				for (var x = 0; x < width; x++) {
					var objectName = result.rows[y][x].object
					if (objectName == 'wall') {
						rowAreas[x].isWall = true
					} else {
						rowAreas[x].isWall = false
						addBotToMap(objectName, rowAreas[x])
						addTrapToMap(objectName, rowAreas[x])
						addPlayerToMap(objectName, rowAreas[x])
						addLootToMap(objectName, rowAreas[x])
					}
				}
			}
			
			$scope.avatar = Team.createTeam('avatar', [$scope.player.avatar], false)
			
			$scope.gameState = GameHandler.createGameState([$scope.avatar, $scope.monsters], 9000)
		})
	}
	
	init()
	
	function moveMonsters() {
		$scope.gameState.robotTurn = 1
		$scope.monstersTurnPlaying = true
		var fullTurn = $scope.gameState.robotQueue.length
		$scope.monstersTurn = $interval(function() {			
            if (!$scope.gameState.isOver() && (fullTurn > 1 || $scope.player.avatar.stunned > 0)) {
              $scope.gameState.nextRobot().takeTurn($scope.map)
			  angular.forEach($scope.teams, function(team) { team.updateBotCount() })
			  fullTurn -= 1			  
            } else {
              $interval.cancel($scope.monstersTurn)
			  $scope.monstersTurnPlaying = false
            }
          }, 100 * GameSettings.getGameSpeed())
	}
	
	$scope.playerMove = function(x, y) {
		function handleEnemy(enemyArea) {
			var enemy = enemyArea.robot
			if (enemy.destroyed) {
				enemyArea.setRobot()
				$scope.monsters.removeBot(enemy)
				$scope.gameState.removeBotFromQueue(enemy)
			} else {
				enemy.receiveDamage($scope.player.avatar.type.typeName, $scope.player.avatar.type.meleeDamage, $scope.map)
			}
		}
		function handleLoot(lootArea) {
			var loot = lootArea.loot
			$scope.player.money += loot.baseValue
			if (loot.goal) {
				$scope.ventureOver = true
			} else {
				lootArea.setLoot()
			}
		}
		if ($scope.ventureOver || $scope.player.avatar.destroyed || $scope.monstersTurnPlaying) return
		var playerArea = $scope.map.findAreaWithBotByTypeName($scope.player.avatar.type.typeName)[0]
		var areaClicked = $scope.map.getAreaByCoord(AreaMap.createCoord(x, y))
		if (playerArea.calculateDistance(areaClicked) == 1 && !areaClicked.isWall) {
			if (areaClicked.robot) {
				handleEnemy(areaClicked)
			} else if (areaClicked.loot) {
				handleLoot(areaClicked)
			} else {
				$scope.map.moveBot(playerArea, areaClicked)
			}
			if (!$scope.ventureOver) moveMonsters()
		}
	}
	
	$scope.clickableClass = function(area) {
		if (!$scope.monstersTurnPlaying && !$scope.ventureOver && area.calculateDistance($scope.map.findAreaWithBotByTypeName($scope.player.avatar.type.typeName)[0]) == 1)
			return 'floor-clickable'
		return 'floor'
	}
	
	$scope.continueCampaign = function() {
		$scope.player.avatar.currentHealth = $scope.player.avatar.type.maxHealth
		$location.path('/game')
	}
	
	$scope.backToMain = function() {
		$location.path('/')
	}
}])