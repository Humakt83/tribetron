'use strict'

angular.module('Tribetron').controller('ShopController', ['$scope', 'Robot', 'Team', function($scope, Robot, Team) {
	
	$scope.botTypes = Robot.getTypesAsObjects()
	
	$scope.team = Team.createTeam('MyTeam', [])
	
	$scope.money = 50
	
	$scope.buyBot = function(botType) {
		$scope.team.addBot(Robot.createRobot(botType))
	}
	
	$scope.getDetails = function(botType) {
		var details = []
		angular.forEach(Object.keys(botType), function(key) {
			if (botType.hasOwnProperty(key) && !(botType[key] instanceof Function) && key !== '$$hashKey') {
				details.push(key + ': ' + botType[key])
			}
		})
		return details
	}
}])