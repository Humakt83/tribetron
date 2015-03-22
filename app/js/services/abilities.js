'use strict'

angular.module('Tribetron').factory('Abilities', [function() {

	var repair = function(source, bot) {
		if (!bot.destroyed)	bot.receiveHealing(source, Math.max(1, Math.floor(bot.type.maxHealth * 0.1)))
	}
	
	var attack = function(source, bot, map) {
		if (!bot.destroyed) {
			var damage = Math.max(1, Math.floor(bot.type.maxHealth * 0.15))
			bot.receiveDamage(source, damage, map)
		}
	}
	
	var abilityNames = ['Repair', 'Attack']
	
	return {
		getAbilityNames : function() {
			return abilities
		},
		getAbility : function(abilityName) {
			var ability
			switch(abilityName) {
				case abilityNames[0]: 
					ability = repair
					break;
				case abilityNames[1]:
					ability = attack
					break;
				default:
					throw 'Invalid ability: ' + abilityName
			}
			return ability
		}
	}
}])