'use strict'

angular.module('Tribetron').factory('Team', [function() {
	function Team(robots, isEnemy) {
		this.containsBot = function(robot) {
			return this.robots.indexOf(robot) > -1
		}
		this.robots = robots
		this.isEnemy = isEnemy
		var toSet = this
		angular.forEach(robots, function(robo) {
			robo.setTeam(toSet)
		})
	}
	return {
		createTeam : function (robots, isEnemy) {
			return new Team(robots, isEnemy)
		}
	}
}])