'use strict'

angular.module('Tribetron').factory('AI', ['Abilities', function(Abilities) {

	var opponents = [NPE, Base, Mega]
	var imgPrefix = 'img/', imgPostfix = '.png'
	
	function NPE() {
		this.taunts = ['Null pointer exception', 'Index out of array bounds', '...', 'Undefined is not defined', 'There is no message for this error', 'An error occurred while displaying previous error',
			'User error - replace user', 'No error occurred', 'BlueScreen has performed an illegal operation']
		this.helloMessage = 'Hello World'
		this.intelligence = 'none'
		this.name = 'NPE'
		this.image = imgPrefix + 'NPEopponent' + imgPostfix
	}
	
	function Base() {
		this.taunts = ['All your base are belong to us', 'Ha ha ha', 'What you say!', 'Somebody set up us the bomb', 'Main screen turn on', 
			'You have no chance to survive make your time', 'Move `ZIG`', 'For great justice']
		this.helloMessage = 'Evening gentlemen'
		this.intelligence = 'low'
		this.name = 'Base'
		this.image = imgPrefix + 'baseopponent' + imgPostfix
	}
	
	function Mega() {
		this.taunts = ['I’ll crush you with my bare hands!', 'Why throw away your life so recklessly?', 'We´ll see who´s ready for the scrap heap!',
			 'I´ll reduce you to titanium fragments', 'I´ve got morons on my team!']
		this.helloMessage = 'Peace through tyranny.'
		this.intelligence = 'medium'
		this.name = 'Mega'
		this.image = imgPrefix + 'megaopponent' + imgPostfix
	}
	
	function Opponent(type) {
		this.playLowIntelligenceTurn = function(team, map) {
			var allies = map.findInjuredAllies(team, 'none', true)
			if (allies && allies.length > 0) {
				Abilities.getAbilityByName('Repair').activate(this.type.name, allies[0].robot, map)
			} else {
				var opponents = map.findOpponents(team)
				Abilities.getAbilityByName('Attack').activate(this.type.name, opponents[0].robot, map)
			}			
		}
		
		this.playMediumIntelligenceTurn = function(team, map) {
			function tryToUseTeleport() {
				function findDangerousBotAndPlaceThemNextToOpponent(type) {
					var dangerous = map.findAreaWithBotByTypeName(type, undefined, true)
					if (dangerous.length > 0) {
						var closest = map.findClosestOpponent(dangerous[0], team)
						if (dangerous[0].calculateDistance(closest) > 2) {
							var areasClose = map.findAreasCloseToArea(closest)
							var areaToTeleport = _.find(areasClose, function(area) {
								return map.botCanBePlacedOnArea(area)
							})
							if (areaToTeleport) {
								map.moveBot(dangerous[0], areaToTeleport)
								return true
							}
						}						
					}
					return false
				}
				var usedTeleport = findDangerousBotAndPlaceThemNextToOpponent('hottot')
				usedTeleport = usedTeleport || findDangerousBotAndPlaceThemNextToOpponent('psycho')
				usedTeleport = usedTeleport || findDangerousBotAndPlaceThemNextToOpponent('totter')
				return usedTeleport
			}
			function tryToStunDangerousOpponent(source) {
				var dangerousTypes = ['titan', 'colossus', 'cannon']
				var foundOne = undefined
				angular.forEach(dangerousTypes, function(typeName) {
					if (!foundOne) {
						var dangerousBots = map.findAreaWithOpponentsBotByTypeName(typeName, team)
						if (dangerousBots.length > 0) {
							foundOne = dangerousBots[0]
						}
					}
				})				
				return foundOne ? Abilities.getAbilityByName('Stun').activate(source, foundOne.robot, true) : false
			}
			var destroyableOpponent = _.find(map.findOpponents(team), function(opponentArea) {
				return Abilities.wouldAttackDestroyBot(opponentArea.robot)
			})
			if (destroyableOpponent) {
				Abilities.getAbilityByName('Attack').activate(this.type.name, destroyableOpponent.robot, map)
			} else if(!tryToUseTeleport() && !tryToStunDangerousOpponent(this.type.name)) {
				this.playLowIntelligenceTurn(team, map)
			}
		}
		
		this.playTurn = function(team, map) {
			switch(this.type.intelligence) {
				case 'none':
					break
				case 'low':
					this.playLowIntelligenceTurn(team, map)
					break
				case 'medium':
					this.playMediumIntelligenceTurn(team, map)
					break
				default:
					break
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