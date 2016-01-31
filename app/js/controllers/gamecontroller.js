'use strict'

angular.module('Tribetron').controller('GameController', ['$scope', '$location', 'Campaign', 'Player', 'InfoOpener', 'SaveGame', function($scope, $location, Campaign, Player, InfoOpener, SaveGame) {
	
	

	$scope.infoOpener = InfoOpener
	
	function initCampaign() {
		$scope.started = true
		Campaign.getCampaignJson().success(function(campaignResult) {
			$scope.campaign = Campaign.createCampaign(campaignResult)
			Campaign.getScenario(Campaign.getCampaign().currentScenario).success(function(result) {
				$scope.scenario = result
			})
		})
	}
	
	function continueCampaign() {
		$scope.campaign = Campaign.getCampaign()
		$scope.started = false
		if ($scope.campaign.isCompleted()) {
			$location.path('/victory')
		} else {
			if (!$scope.campaign.loaded) $scope.campaign.advanceCampaign()
			else $scope.campaign.loaded = false
			Campaign.getScenario(Campaign.getCampaign().currentScenario).success(function(result) {
				$scope.scenario = result
				if ($scope.scenario.levelup) $scope.player.levelUp()
			})
		}
	}
	
	if (!Player.getPlayer()) {
		$location.path('/')
		return
	}
	
	$scope.player = Player.getPlayer()
	
	if (!Campaign.getCampaign()) {
		initCampaign()
	} else {
		continueCampaign()
	}

	$scope.saveGame = function() {
		SaveGame.save($scope.player, $scope.campaign)
	}
	
	$scope.goToShop = function() {
		$location.path('/shop')
	}
	
	$scope.goToPairs = function() {
		$location.path('/pairs')
	}
	
	$scope.goToConquest = function() {
		$location.path('/conquest')
	}
	
	$scope.goToChess = function() {
		$location.path('/chess')
	}
	
	$scope.goToAdventure = function() {
		$location.path('/venture')
	}
	
	$scope.getEnemyBotClass = function(type) {
		if (type == 'unknown')
			return type
		return type + '_enemy'
	}
}])