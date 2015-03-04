'use strict'

angular.module('Tribetron').factory('Player', ['Team', function(Team) {
	
	function Player(playerName, teamName) {
		this.name = playerName
		this.money = 50
		this.team = Team.createPlayerTeam(teamName, [])
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