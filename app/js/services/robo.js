'use strict'

angular.module('Tribetron').factory('Robot', [function() {
	var types = [Hunter, Box, Medic, Totter]
	
	function Hunter() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var opponentAreas = map.findOpponents(team)
			var closestOpponent = area.findClosest(opponentAreas)
			if (area.calculateDistance(closestOpponent) < 2) closestOpponent.robot.destroyed = true
			else map.moveBotTowards(area, closestOpponent)
		}
		this.name = 'hunter'
	}
	
	function Box() {
		this.takeTurn = function() {
			return
		}
		this.name = 'box'
	}
	
	function Medic() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var injuredAreas = map.findInjuredAllies(team)
			if (injuredAreas.length > 0) {
				var closestInjured = area.findClosest(injuredAreas)
				if (area.calculateDistance(closestInjured) < 2) closestInjured.robot.destroyed = false
				else map.moveBotTowards(area, closestInjured)
			}
		}
		this.name = 'medic'
	}
	
	function Totter() {
		this.takeTurn = function(bot, map) {
			var area = map.findAreaWhereBotIs(bot)
			var areasNear = map.findAreasCloseToArea(area)
			var areaToMove = areasNear[Math.floor(Math.random() * areasNear.length)]
			if (areaToMove.robot) {
				bot.destroyed = true
				areaToMove.robot.destroyed = true
			} else if (areaToMove.isWall) {
				bot.destroyed = true
			} else {
				map.moveBot(area, areaToMove)
			}
		}
		this.name = 'totter'
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
			return this.type.name + postfix
		}
		this.type = type;
		this.destroyed = false;
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