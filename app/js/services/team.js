'use strict'

angular.module('Tribetron').factory('Team', [function() {
	function Team(robots, isEnemy) {
		this.containsBot = function(robot) {
			return this.robots.indexOf(robot) > -1
		}
		this.robots = robots
		this.isEnemy = isEnemy
		var thisTeam = this
		angular.forEach(robots, function(robo) {
			robo.setTeam(thisTeam)
		})
	}
	return {
		createTeam : function (robots, isEnemy) {
			return new Team(robots, isEnemy)
		}
	}
}])