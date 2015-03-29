'use strict'

angular.module('Tribetron').factory('Abilities', [function() {
	
	var calculateDamage = function(bot) {
		return Math.max(1, Math.floor(bot.type.maxHealth * 0.15))
	}
	
	function Repair() {
		this.activate = function(source, bot) {
			if (!bot.destroyed) {
				bot.receiveHealing(source, Math.max(1, Math.floor(bot.type.maxHealth * 0.1)))
				return true
			}
			return false
		}
		this.name = 'Repair'
		this.levelRequirement = 1
	}
	
	function Attack() {
		this.activate = function(source, bot, map) {
			if (!bot.destroyed) {
				var damage = calculateDamage(bot)
				bot.receiveDamage(source, damage, map)
				return true
			}
			return false
		}
		this.name = 'Attack'
		this.levelRequirement = 1
	}
	
	function Teleport() {
		this.activate = function(source, bot, map, targetArea) {
			if (!this.selectedBot) {
				this.selectedBot = bot
				return false
			} else if (targetArea.isEmpty()){
				map.moveBot(map.findAreaWhereBotIs(this.selectedBot), targetArea)
				this.selectedBot = undefined
				return true
			} else {
				this.selectedBot = undefined
				return false
			}
		}
		this.selectedBot = undefined
		this.name = 'Teleport'
		this.levelRequirement = 3
	}
	
	var abilities = [new Attack(), new Repair(), new Teleport()]
	
	return {
		getAbilities : function() {
			return abilities
		},
		getAbilityByName : function(name) {
			return _.find(abilities, function(ability) {
				return ability.name === name
			})
		},
		wouldAttackDestroyBot : function(bot) {
			return bot.currentHealth <= calculateDamage(bot)
		}
	}
}])