'use strict'

angular.module('Tribetron').controller('ShopController', ['$scope', '$location', '$modal', 'Robot', 'Player', 'Campaign', function($scope, $location, $modal, Robot, Player, Campaign) {
	
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
		if (botType.levelRequirement > $scope.player.level)
			throw 'Player level too low'
		if ($scope.maxRosterSize <= $scope.team.robots.length)
			throw 'Already at full team size'
		if ($scope.money < botType.price)
			throw 'Can`t afford'
		$scope.team.addBot(Robot.createRobot(botType))
		$scope.money -= botType.price
	}
	
	$scope.getDetails = function(botType) {
		var details = []
		angular.forEach(Object.keys(botType), function(key) {
			if (botType.hasOwnProperty(key) && !(botType[key] instanceof Function) && key !== '$$hashKey' && key != 'typeName' && key != 'description') {
				details.push(key + ': ' + botType[key])
			}
		})
		return details
	}
	
	$scope.toBattle = function() {
		$scope.player.money = $scope.money
		$location.path('/battle')
	}
	
	$scope.brokenBotClass = function(bot) {
		return 'repair'
	}
	
	$scope.sellOrRepair = function(bot) {
		 var modalInstance = $modal.open({
			templateUrl: './partials/sellorrepair.html',
			controller: 'SellOrRepair',
			size: 'sm',
			resolve: {
				bot: function () {
					return bot
				},
				money: function() {
					return $scope.money
				}
			}
		});

        modalInstance.result.then(function (result) {
			$scope.money = result
		});
	}
}])

angular.module('Tribetron').controller('SellOrRepair', ['$scope', '$modalInstance', 'Player', 'bot', 'money', function ($scope, $modalInstance, Player, bot, money) {
    
	function calculatePrice(reduction, repair) {
		var price = Math.floor(bot.type.price * (bot.currentHealth / bot.type.maxHealth)) - reduction
		price = repair? bot.type.price - price : price
		return price > 0 ? price : 0
	}
	
    $scope.robot = bot    
	$scope.money = money
	$scope.repairPrice = calculatePrice(0, true)
	$scope.sellPrice = calculatePrice(1)
	
    $scope.cancel = function () {
		$modalInstance.dismiss('cancel');
    };

   	$scope.sellBot = function() {
		Player.getPlayer().team.removeBot($scope.robot)
		$modalInstance.close(money += $scope.sellPrice)
	}
	
	$scope.repairBot = function() {
		$scope.robot.currentHealth = $scope.robot.type.maxHealth
		$modalInstance.close($scope.money -= $scope.repairPrice)	
	}
	
}]);