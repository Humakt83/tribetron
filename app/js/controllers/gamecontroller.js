'use strict'

angular.module('Tribetron').controller('GameController', ['$scope', '$location', 'Campaign', 'Player', function($scope, $location, Campaign, Player) {

	$scope.player = Player.createPlayer('player', 'Superions')
	$scope.campaign = Campaign.getCampaignJson()
	Campaign.getCampaignJson().success(function(campaignResult) {
		$scope.campaign = Campaign.createCampaign(campaignResult)
		Campaign.getScenario($scope.campaign.currentScenario).success(function(result) {
			$scope.scenario = result
		})
	})
	
	$scope.goToShop = function() {
		$location.path('/shop')
	}
}])