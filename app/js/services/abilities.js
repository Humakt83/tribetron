'use strict'

angular.module('Tribetron').factory('Abilities', [function() {
	
	var imagePrefix = 'img/', imagePostfix = '.png'
	
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
        this.description = 'An ability to repair a bot in the battlefield. Repairs at maximum 10% of bots maximum health.'
		this.levelRequirement = 1
		this.image= imagePrefix + 'repair' + imagePostfix
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
        this.description = 'Attack a bot to deal damage equal to 15 percent of bot`s maximum health'
		this.levelRequirement = 1
		this.image= imagePrefix + 'hit' + imagePostfix
	}
    
    function Shield() {
        this.activate = function(source, bot) {
            if (!bot.destroyed) {
                bot.shield++
                return true
            }
            return false
        }
        this.name = 'Shield'
        this.description = 'Shields the bot against the next attack it receives.'
        this.levelRequirement = 2
        this.image = imagePrefix + 'shield' + imagePostfix
    }
	
	function Teleport() {
		this.activate = function(source, bot, map, targetArea) {
			if (!this.selectedBot) {
				this.selectedBot = bot
				return false
			} else if (targetArea.isEmpty()){
				map.moveBot(map.findAreaWhereBotIs(this.selectedBot), targetArea)
				this.selectedBot = undefined
				this.cooldownLeft = this.cooldown
				return true
			} else {
				this.selectedBot = undefined
				return false
			}
		}
		this.selectedBot = undefined
		this.name = 'Teleport'
        this.description = 'Teleports a bot from one place to another in the battlefield.'
		this.levelRequirement = 5
		this.image= imagePrefix + 'teleport' + imagePostfix
		this.cooldown = 3
		this.cooldownLeft = 0
	}
	
	function Stun() {
		this.activate = function(source, bot, doNotSetCooldown) {
			if (!bot.destroyed) {
				bot.stun(1)
				if (doNotSetCooldown !== true) this.cooldownLeft = this.cooldown
				return true
			}
			return false
		}
		this.name = 'Stun'
        this.description = 'Disables a bot for a turn.'
		this.levelRequirement = 3
		this.image= imagePrefix + 'stun' + imagePostfix
		this.cooldown = 2
		this.cooldownLeft = 0
	}
	
	var abilities = [new Attack(), new Repair(), new Stun(), new Teleport(), new Shield()]
	
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
		},
		reduceCooldowns : function() {
			angular.forEach(abilities, function(ability) {
				if (ability.cooldown) {
					ability.cooldownLeft = Math.max(0, ability.cooldownLeft - 1)
				}
			})
		},
        actionPossible : function(actionName, area, selectedBot) {
            var actionPossible
            switch (actionName) {
                case 'Repair': 
                    actionPossible = area.robot && !area.robot.destroyed && area.robot.currentHealth < area.robot.type.maxHealth
                    break
                case 'Attack': 
                    actionPossible = area.robot && !area.robot.destroyed
                    break
                case 'Teleport':
                    actionPossible = (area.robot && !selectedBot && !area.robot.type.cannotBeTeleported) || (selectedBot && area.isEmpty())
                    break;
                case 'Shield':
                case 'Stun':
                    actionPossible = area.robot && !area.robot.destroyed
                    break;
                default:
                    actionPossible = false
            }
            return this.getAbilityByName(actionName).cooldownLeft > 0 ? false : actionPossible;
        },
		reset : function() {
			angular.forEach(abilities, function(ability) {
				if (ability.cooldown) {
					ability.cooldownLeft = 0
				}
			})
		}
	}
}])