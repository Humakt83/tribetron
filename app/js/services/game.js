'use strict'

angular.module('Tribetron').factory('GameHandler', [function() {

	function buildRobotQueue(teams) {
		return _.compact(_.flatten(_.zip.apply(_, _.map(teams, function(team) { return team.robots }))))
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