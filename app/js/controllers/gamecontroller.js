'use strict'

angular.module('Tribetron').controller('GameController', ['$scope', '$location', '$window', 'Campaign', 'Player', 'InfoOpener', function($scope, $location, $window, Campaign, Player, InfoOpener) {
	
	const SAVENAME = 'tribetronSave'

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
			$scope.campaign.advanceCampaign()
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

	$scope.localStorageAllowed = function() {
		try {
    		return 'localStorage' in $window && $window['localStorage'] !== null;
  		} catch (e) {
    		return false;
  		}
	}

	$scope.saveGame = function() {
		localStorage.clear()
		localStorage[SAVENAME + '.player'] = JSON.stringify($scope.player)
		localStorage[SAVENAME + '.campaign'] = JSON.stringify($scope.campaign)
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