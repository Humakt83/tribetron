'use strict'

angular.module('Tribetron').factory('PositionService', [function() {

	function Position(x, y) {
		this.newPosition = function(xModifier, yModifier) {
			return new Position(this.x + xModifier, this.y + yModifier)
		}
		this.x = x
		this.y = y
	}
	
	return {
		createPosition : function(x, y) {
			return new Position(x, y)
		}
	}
}])