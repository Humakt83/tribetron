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
		var playerArea = $scope.map.findAreaWithBotByTypeName($scope.player.avatar.type.typeName)[0]
		var areaClicked = $scope.map.getAreaByCoord(AreaMap.createCoord(x, y))
		console.log(playerArea)
		if (playerArea.calculateDistance(areaClicked) == 1 && !areaClicked.isWall) {
			if (areaClicked.robot) {
				handleEnemy(areaClicked)
			} else {
				$scope.map.moveBot(playerArea, areaClicked)
			}
		}
	}
}])