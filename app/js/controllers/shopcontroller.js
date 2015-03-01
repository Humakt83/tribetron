'use strict'

angular.module('Tribetron').controller('ShopController', ['$scope', 'Robot', 'Team', function($scope, Robot, Team) {
	
	$scope.botTypes = Robot.getTypesAsObjects()
	
	$scope.team = Team.createTeam('MyTeam', [])
	
	$scope.money = 50
	
	$scope.maxRosterSize = 10
	
	$scope.buyBot = function(botType) {
		if ($scope.maxRosterSize <= $scope.team.robots.length)
			throw 'Already at full team size'
		if ($scope.money < botType.price)
			throw 'Can`t afford'
		$scope.team.addBot(Robot.createRobot(botType))
		$scope.money -= botType.price
	}
	
	$scope.sellBot = function(robot) {
		$scope.team.removeBot(robot)
		$scope.money += robot.type.price
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