'use strict'

angular.module('Tribetron').controller('GameController', ['$scope', '$location', 'Campaign', 'Player', 'Robot', 'InfoOpener', 'SaveGame', 
                                                          function($scope, $location, Campaign, Player, Robot, InfoOpener, SaveGame) {
	
	$scope.infoOpener = InfoOpener
    
    function setOpponentRosterForCustomBattle(result) {
        var width = result.rows[0].length, height = result.rows.length			
        $scope.scenario.rosterOpponent = []
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var objectName = result.rows[y][x].object
                var botType = _.find(Robot.getTypesAsObjects(), function(type) {
                    return type.typeName == objectName;
                })                            
                if (botType) $scope.scenario.rosterOpponent.push(botType.typeName);
            }
        }
    }
	
    function loadScenario() {        
        Campaign.getScenario(Campaign.getCampaign().currentScenario).success(function(result) {
            $scope.scenario = result
            if ($scope.scenario.levelup) $scope.player.levelUp()
            if ($scope.scenario.type && $scope.scenario.type == 'battle') {
                setOpponentRosterForCustomBattle(result);
            }
        })
    }
    
	function initCampaign() {
		$scope.started = true
		Campaign.getCampaignJson().success(function(campaignResult) {
			$scope.campaign = Campaign.createCampaign(campaignResult)
			loadScenario()
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
            loadScenario()
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