'use strict'

angular.module('Tribetron').controller('ShopController', ['$scope', '$location', 'Robot', 'Player', 'Campaign', function($scope, $location, Robot, Player, Campaign) {
	
	$scope.player = Player.getPlayer()
	
	if (!$scope.player) {
		$location.path('/')
		return
	}
	
	$scope.botTypes = Robot.getTypesAsObjects()
	
	$scope.team = $scope.player.team
	
	$scope.money = $scope.player.money
	
	Campaign.getScenario(Campaign.getCampaign().currentScenario).success(function(result) {
		$scope.maxRosterSize = result.maxRoster
	})
	
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
			if (botType.hasOwnProperty(key) && !(botType[key] instanceof Function) && key !== '$$hashKey' && key != 'typeName') {
				details.push(key + ': ' + botType[key])
			}
		})
		return details
	}
	
	$scope.toBattle = function() {
		$scope.player.money = $scope.money
		$location.path('/battle')
	}
}])