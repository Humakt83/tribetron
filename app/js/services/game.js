'use strict'

angular.module('Tribetron').factory('GameHandler', ['ngIterator', function(ngIterator) {

	function buildRobotQueue(teams) {
		var queue = [], teamIterators = [], queueLength = 0, queueIndex = 0
		angular.forEach(teams, function(team) { 
			teamIterators.push(ngIterator(team.robots))
			queueLength += team.robots.length
		})
		while (queueIndex < queueLength) {
			angular.forEach(teamIterators, function(teamIterator) {
				if (teamIterator.hasNext()) {
					queue.push(teamIterator.next())
					queueIndex += 1
				}
			})
		}
		return queue
	}

	function GameState(teams) {
		this.nextTurn = function() {
			var robot = robots[robotTurn]
			
			return robot
		}
		this.teams = teams
		this.robotQueue = buildRobotQueue(teams)
		this.robotTurn = 0
	}
	
	return {
		createGameState : function(teams) {
			return new GameState(teams)
		}
	}
}])