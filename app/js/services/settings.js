'use strict'

angular.module('Tribetron').factory('GameSettings', [function() {
	
	var gameSpeedMultipliers = [1.0, 1.5, 2.0, 2.5, 3.0]
	
	var selectedGameSpeed = gameSpeedMultipliers[2]
	
	return {
		getGameSpeed: function() {
			return selectedGameSpeed
		},
		getSpeedOptions: function() {
			return gameSpeedMultipliers
		},
		decreaseSpeed: function() {
			var indexGS = gameSpeedMultipliers.indexOf(selectedGameSpeed)
			if (indexGS < gameSpeedMultipliers.length - 1) selectedGameSpeed = gameSpeedMultipliers[indexGS + 1]
		},
		increaseSpeed: function() {
			var indexGS = gameSpeedMultipliers.indexOf(selectedGameSpeed)
			if (indexGS > 0) selectedGameSpeed = gameSpeedMultipliers[indexGS - 1]
		},
		canDecreaseSpeed: function() {
			return gameSpeedMultipliers.indexOf(selectedGameSpeed) < gameSpeedMultipliers.length - 1
		},
		canIncreaseSpeed: function() {
			return gameSpeedMultipliers.indexOf(selectedGameSpeed) > 0
		}
	
	}
}])