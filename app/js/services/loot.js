'use strict'

angular.module('Tribetron').factory('Loot', [function() {
	
	var lootTypes = [Treasure, Money]
	
	function Treasure() {
		this.baseValue = 50
		this.goal = true
		this.name = 'Treasure'
		this.cssName = 'treasure'
		this.pickupMessage = 'Treasure is yours'
	}
	
	function Money() {
		this.baseValue = 5
		this.goal = false
		this.name = 'Money'
		this.cssName = 'money'
		this.pickupMessage = 'You picked up some money'
	}
	
	return {
		getLootTypesAsObjects: function() {
			return _.map(lootTypes, function(type) { return new type()})
		}
	}
}])