'use strict'

angular.module('Tribetron').factory('Robot', [function() {
	var types = ['hunter']
	function Robot(type) {
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