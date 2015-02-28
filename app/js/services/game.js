'use strict'

angular.module('Tribetron').factory('GameHandler', ['$filter', 'BattleLog', function($filter, BattleLog) {

	function buildRobotQueue(teams) {
		return _.compact(_.flatten(_.zip.apply(_, _.map(teams, function(team) { return team.robots }))))
	}

	function GameState(teams, maxRounds) {
		this.nextRobotTurn = function() {
			if (this.robotQueue.length > this.robotTurn + 1) {
				this.robotTurn += 1 
			} else {
				this.round += 1
				BattleLog.add('Round: ' + this.round + ' starts.')
				this.robotTurn = 0
			}
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
			BattleLog.add('Turn of ' + bot.type.typeName + ' from team ' + bot.team.name) 
			return bot
		}
		
		this.isOver = function() {
			var teamsWithBotsLeft = 0
			angular.forEach(teams, function(team) {
				teamsWithBotsLeft += $filter('filter')(team.robots, {'destroyed':false}).length > 0 ? 1 : 0
			})
			return this.round >= maxRounds || teamsWithBotsLeft < 2
		}
		
		this.getWinner = function() {
			var winningTeam
			angular.forEach(this.teams, function(team) {
				if (!winningTeam || team.botsRemaining() > winningTeam.botsRemaining())
					winningTeam = team
				else 
					winningTeam = !winningTeam || winningTeam.botsRemaining() === team.botsRemaining() ? undefined : winningTeam
			})
			return winningTeam
		}
		
		this.maxRounds = maxRounds
		this.teams = teams
		this.robotQueue = buildRobotQueue(teams)
		this.robotTurn = 0
		this.round = 1
	}
	
	return {
		createGameState : function(teams, maxRounds) {
			return new GameState(teams, maxRounds)
		}
	}
}])