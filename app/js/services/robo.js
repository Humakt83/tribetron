'use strict'

angular.module('Tribetron').factory('Robot', [function() {
	var types = ['hunter']
	function Robot(type) {
		this.type = type;
	}
	
	return {
		createRobot : function(type) {
			return new Robot(type)
		},
		getTypes : function() {
			return types
		}
	}
}])