'use strict'

angular.module('Tribetron').factory('Robot', ['BattleLog', function(BattleLog) {
	var types = [Hunter, Box, Medic, Totter, Radiator, Psycho, Crate]
	
	function Hunter() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var opponentAreas = map.findOpponents(team)
			var closestOpponent = area.findClosest(opponentAreas)
			if (area.calculateDistance(closestOpponent) < 2) 
				closestOpponent.robot.receiveDamage('Hunter', this.meleeDamage)
			else {
				BattleLog.add('Hunter moves towards enemy.')
				map.moveBotTowards(area, closestOpponent)
			}
		}
		this.price = 10
		this.maxHealth = 10
		this.meleeDamage = 5
		this.intelligence = 'low'
		this.typeName = 'hunter'
	}
	
	function Box() {
		this.takeTurn = function() {
			BattleLog.add('Box does nothing.')
		}
		this.typeName = 'box'
		this.price = 0
		this.maxHealth = 5
		this.intelligence = 'none'
	}
	
	function Crate() {
		this.takeTurn = function() {
			BattleLog.add('Crate does nothing.')
		}
		this.typeName = 'crate'
		this.price = 5
		this.maxHealth = 30
		this.intelligence = 'none'
	}
	
	function Medic() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var injuredAreas = map.findInjuredAllies(team, bot)
			if (injuredAreas.length > 0) {
				var closestInjured = area.findClosest(injuredAreas)
				if (area.calculateDistance(closestInjured) < 2) closestInjured.robot.receiveHealing('Medic', this.heal)
				else {
					map.moveBotTowards(area, closestInjured)
					BattleLog.add('Medic moves towards injured ally')
				}
			} else BattleLog.add('Medic does nothing.')
		}
		this.price = 12
		this.heal = 4
		this.maxHealth = 8
		this.intelligence = 'low'
		this.typeName = 'medic'
	}
	
	function Totter() {
		this.takeTurn = function(bot, map) {
			var area = map.findAreaWhereBotIs(bot)
			var areasNear = map.findAreasCloseToArea(area)
			var areaToMove = areasNear[Math.floor(Math.random() * areasNear.length)]
			if (areaToMove.robot) {
				bot.receiveDamage('self', this.meleeDamage)
				areaToMove.robot.receiveDamage('Totter', this.meleeDamage)
			} else if (areaToMove.isWall) {
				bot.receiveDamage('Wall', this.meleeDamage)
			} else {
				BattleLog.add('Totter randomly tots around')
				map.moveBot(area, areaToMove)
			}
		}
		this.price = 1
		this.maxHealth = 9
		this.meleeDamage = 8
		this.intelligence = 'insane'
		this.typeName = 'totter'
	}
	
	function Radiator() {
		this.radiateDamage = function(map, area, bot) {
			var areasNear = map.findAreasCloseToArea(area)
			angular.forEach(areasNear, function(areaNear) {
				if (areaNear.robot) areaNear.robot.receiveDamage('Radiator', bot.type.radiationDamage)
			})
		}
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var opponentAreas = map.findOpponents(team)
			var closestOpponent = area.findClosest(opponentAreas)
			if (area.calculateDistance(closestOpponent) < 2) {
				this.radiateDamage(map, area, bot)
			} else {
				BattleLog.add('Radiator moves towards enemy.')
				map.moveBotTowards(area, closestOpponent)
			}
		}
		this.price = 10
		this.maxHealth = 9
		this.radiationDamage = 4
		this.intelligence = 'low'
		this.typeName = "radiator"
	}
	
	function Psycho() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var botAreas = map.findAreasWithOtherBots(bot, false)
			var target = _.find(botAreas, function(botArea) {
				return map.areaCanbeReachedInStraightLine(area, botArea) && !map.anythingBetweenAreas(area, botArea)
			})
			if (target && !target.robot.destroyed) {
				while (area.calculateDistance(target) > 1) {
					map.moveBotTowardsInStraightLine(area, target)
					area = map.findAreaWhereBotIs(bot)
				}
				BattleLog.add('Psycho rams its target')
				target.robot.receiveDamage('Psycho', this.meleeDamage)
			} else {
				BattleLog.add('Psycho did not find suitable target to destroy.')
			}
		}
		this.price = 20
		this.maxHealth = 15
		this.meleeDamage = 10
		this.intelligence = 'insane'
		this.typeName = "psycho"
	}
	
	function Robot(type) {
		this.takeTurn = function(map) {
			this.type.takeTurn(this, map, this.team)
		}
		this.setTeam = function(team) {
			this.team = team
		}
		this.getTypeClass = function() {
			var postfix = this.team.isEnemy ? '_enemy' : ''
			return this.type.typeName + postfix
		}
		this.receiveDamage = function(source, damage) {
			this.currentHealth = Math.max(0, (this.currentHealth - damage))
			BattleLog.add(this.type.typeName + ' receives ' + damage + ' from ' + source) 
			if (this.currentHealth <= 0) {
				BattleLog.add(this.type.typeName + ' is destroyed')
				this.destroyed = true
			}
		}
		this.receiveHealing = function(source, heal) {
			this.destroyed = false
			this.currentHealth = Math.min(this.type.maxHealth, (this.currentHealth + heal))
			BattleLog.add(source + ' heals ' + this.type.typeName + ' for ' + heal + ' health')
		}
		this.isInjured = function() {
			return this.currentHealth < this.type.maxHealth
		}
		this.calculatePercentageOfHealth = function() {
			return Math.round((this.currentHealth / this.type.maxHealth) * 100)
		}
		this.type = type;
		this.destroyed = false;
		this.currentHealth = this.type.maxHealth
	}
	
	return {
		createRobot : function(type) {
			return new Robot(type)
		},
		getTypes : function() {
			return types
		},
		getTypesAsObjects : function() {
			return _.map(types, function(type) { return new type()})
		}
	}
}])