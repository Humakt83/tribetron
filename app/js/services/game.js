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
		this.nextRobotTurn = function() {
			this.robotTurn = this.robotQueue.length > this.robotTurn + 1? this.robotTurn + 1 : 0
		}
		this.nextRobot = function() {
			var bot = this.robotQueue[this.robotTurn], attemptsCounter = 0
			this.nextRobotTurn()
			while(bot.destroyed) {
				if (attemptsCounter > this.robotQueue.length) throw "All robots have been destroyed"
				bot = this.robotQueue[this.robotTurn]
				this.nextRobotTurn()
				attemptsCounter += 1
			}
			return bot
			
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