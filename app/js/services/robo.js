'use strict'

angular.module('Tribetron').factory('Robot', [function() {
	var types = ['hunter']
	function Robot(type) {
		this.takeTurn = function(map) {
			var area = map.findAreaWhereBotIs(this)
			var opponentAreas = map.findOpponents(this.team)
			var closestOpponent = area.findClosest(opponentAreas)
			if (area.calculateDistance(closestOpponent) < 2) closestOpponent.robot.destroyed = true
			else map.moveBotTowards(area, closestOpponent)
		}
		this.setTeam = function(team) {
			this.team = team
		}
		this.getTypeClass = function() {
			var postfix = this.team.isEnemy ? '_enemy' : ''
			return this.type + postfix
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