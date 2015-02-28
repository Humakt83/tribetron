'use strict'

angular.module('Tribetron').factory('Robot', [function() {
	var types = [Hunter, Box, Medic, Totter]
	
	function Hunter() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var opponentAreas = map.findOpponents(team)
			var closestOpponent = area.findClosest(opponentAreas)
			if (area.calculateDistance(closestOpponent) < 2) 
				closestOpponent.robot.receiveDamage(this.meleeDamage)
			else 
				map.moveBotTowards(area, closestOpponent)
		}
		this.maxHealth = 10
		this.meleeDamage = 5
		this.typeName = 'hunter'
	}
	
	function Box() {
		this.takeTurn = function() {
			return
		}
		this.typeName = 'box'
		this.maxHealth = 5
	}
	
	function Medic() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var injuredAreas = map.findInjuredAllies(team, bot)
			if (injuredAreas.length > 0) {
				var closestInjured = area.findClosest(injuredAreas)
				if (area.calculateDistance(closestInjured) < 2) closestInjured.robot.receiveHealing(this.heal)
				else map.moveBotTowards(area, closestInjured)
			}
		}
		this.heal = 4
		this.maxHealth = 8
		this.typeName = 'medic'
	}
	
	function Totter() {
		this.takeTurn = function(bot, map) {
			var area = map.findAreaWhereBotIs(bot)
			var areasNear = map.findAreasCloseToArea(area)
			var areaToMove = areasNear[Math.floor(Math.random() * areasNear.length)]
			if (areaToMove.robot) {
				bot.receiveDamage(this.meleeDamage)
				areaToMove.robot.receiveDamage(this.meleeDamage)
			} else if (areaToMove.isWall) {
				bot.receiveDamage(this.meleeDamage)
			} else {
				map.moveBot(area, areaToMove)
			}
		}
		this.maxHealth = 9
		this.meleeDamage = 8
		this.typeName = 'totter'
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
		this.receiveDamage = function(damage) {
			this.currentHealth = Math.max(0, (this.currentHealth - damage))
			if (this.currentHealth <= 0) {
				this.destroyed = true
			}
		}
		this.receiveHealing = function(heal) {
			this.destroyed = false
			this.currentHealth = Math.min(this.type.maxHealth, (this.currentHealth + heal))
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
		}
	}
}])