'use strict'

angular.module('Tribetron').factory('Loot', [function() {

	var lootTypes = [Treasure, Money, Toolkit]
	
	function Treasure() {
		this.pickup = function(player) {
			player.money += this.baseValue
		}
		this.baseValue = 50
		this.goal = true
		this.name = 'Treasure'
		this.cssName = 'treasure'
		this.pickupMessage = 'Treasure!'
	}
	
	function Money() {
		this.pickup = function(player) {
			player.money += this.baseValue
		}
		this.baseValue = 5
		this.goal = false
		this.name = 'Money'
		this.cssName = 'money'
		this.pickupMessage = '+' + this.baseValue + ' tribs'
	}
	
	function Toolkit() {
		this.pickup = function(player) {
			player.avatar.receiveHealing(this.name, this.baseValue)
		}
		this.baseValue = 10
		this.goal = false
		this.name = 'Toolkit'
		this.cssName = 'toolkit'
		this.pickupMessage = '+ ' + this.baseValue + ' hp'
	}
	
	return {
		getLootTypesAsObjects: function() {
			return _.map(lootTypes, function(Type) { return new Type()})
		}
	}
}])