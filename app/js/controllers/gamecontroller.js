'use strict'

angular.module('Tribetron').controller('GameController', ['$scope', '$location', 'Campaign', 'Player', function($scope, $location, Campaign, Player) {
	
	function initCampaign() {
		$scope.player = Player.createPlayer('Thunder', 'Superions')
		$scope.started = true
		Campaign.getCampaignJson().success(function(campaignResult) {
			$scope.campaign = Campaign.createCampaign(campaignResult)
			Campaign.getScenario(Campaign.getCampaign().currentScenario).success(function(result) {
				$scope.scenario = result
			})
		})
	}
	
	function continueCampaign() {
		$scope.player = Player.getPlayer()
		$scope.campaign = Campaign.getCampaign()
		$scope.started = false
		$scope.campaign.advanceCampaign()
		Campaign.getScenario(Campaign.getCampaign().currentScenario).success(function(result) {
			$scope.scenario = result
		})
	}
	
	if (!Player.getPlayer() || !Campaign.getCampaign()) {
		initCampaign()
	} else {
		continueCampaign()
	}
	
	$scope.goToShop = function() {
		$location.path('/shop')
	}
	
	$scope.goToPairs = function() {
		$location.path('/pairs')
	}
	
	$scope.getEnemyBotClass = function(type) {
		if (type == 'unknown')
			return type
		return type + '_enemy'
	}
}])