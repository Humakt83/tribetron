'use strict'

angular.module('Tribetron').factory('Player', ['Team', 'Robot', function(Team, Robot) {
	
	function Avatar() {
		this.takeTurn = function(bot, map, team) {
			return
		}
		this.maxHealth = 20
		this.meleeDamage = 5
		this.intelligence = 'smartypants'
		this.typeName = 'avatar'
		this.description = 'Avatar of the player'
	}
	
	function Player(playerName, teamName) {
		this.levelUp = function() {
			this.level += 1
		}
		this.name = playerName
		this.money = 0
		this.team = Team.createPlayerTeam(teamName, [])
		this.level = 1
		this.avatar = Robot.createRobot(new Avatar())
	}
	
	var player;
	
	return {
		createPlayer: function(playerName, teamName) {
			player = new Player(playerName, teamName)
			return player
		},
		getPlayer: function() {
			return player
		},
		reset: function() {
			player = undefined
		}
	}
}])