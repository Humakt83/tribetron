'use strict'

angular.module('Tribetron').controller('GameController', ['$scope', '$location', 'Campaign', 'Player', function($scope, $location, Campaign, Player) {
	
	function initCampaign() {
		$scope.player = Player.createPlayer('player', 'Superions')
		$scope.started = true
		Campaign.getCampaignJson().success(function(campaignResult) {
			$scope.campaign = Campaign.createCampaign(campaignResult)
		})
	}
	
	function continueCampaign() {
		$scope.player = Player.getPlayer()
		$scope.campaign = Campaign.getCampaign()
		$scope.started = false
	}
	
	if (!Player.getPlayer() || !Campaign.getCampaign()) {
		initCampaign()
	} else {
		continueCampaign()
	}
	
	$scope.goToShop = function() {
		if (!$scope.started) $scope.campaign.advanceCampaign()
		$location.path('/shop')
	}
}])