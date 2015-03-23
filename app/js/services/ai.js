'use strict'

angular.module('Tribetron').factory('AI', ['Abilities', function(Abilities) {

	var opponents = [NPE, Base]
	var imgPrefix = 'img/', imgPostfix = '.png'
	
	function NPE() {
		this.taunts = ['Null pointer exception', 'Index out of array bounds', '...', 'Undefined is not defined']
		this.intelligence = 'none'
		this.name = 'NPE'
		this.image = imgPrefix + 'NPEopponent' + imgPostfix
	}
	
	function Base() {
		this.taunts = ['All your base are belong to us', 'Evening gentlemen', 'Ha ha ha', 'What you say!', 'Somebody set up us the bomb', 'Main screen turn on', 
			'You have no chance to survive make your time', 'Move `ZIG`', 'For great justice']
		this.intelligence = 'low'
		this.name = 'Base'
		this.image = imgPrefix + 'baseopponent' + imgPostfix
	}
	
	function Opponent(type) {
		this.playLowIntelligenceTurn = function(team, map) {
			var allies = map.findInjuredAllies(team, 'none', true)
			if (allies && allies.length > 0) {
				Abilities.getAbility('Repair')(this.type.name, allies[0].robot, map)
			} else {
				var opponents = map.findOpponents(team)
				Abilities.getAbility('Attack')(this.type.name, opponents[0].robot, map)
			}
			
		}
		this.playTurn = function(team, map) {
			switch(this.type.intelligence) {
				case 'none':
					break;
				case 'low':
					this.playLowIntelligenceTurn(team, map)
					break;
				default:
					break;
			}
			return this.type.taunts[Math.floor(Math.random() * this.type.taunts.length)]
		}
		this.type = type
	}
	
	return {
		getOpponents : function() {
			return opponents
		},
		getOpponentByName : function(name) {
			return _.find(opponents, function(type) {
				return new type().name == name
			})
		},
		createOpponent : function(type) {
			return new Opponent(new type())
		}
	}
}])