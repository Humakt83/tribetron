'use strict'

angular.module('Tribetron').factory('Player', ['Team', function(Team) {
	
	function Player(playerName, teamName) {
		this.levelUp = function() {
			this.level += 1
		}
		this.name = playerName
		this.money = 50
		this.team = Team.createPlayerTeam(teamName, [])
		this.level = 1
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