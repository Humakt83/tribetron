'use strict'

angular.module('Tribetron').controller('GameController', ['$scope', '$location', '$modal', 'Campaign', 'Player', 'Robot', 'InfoOpener', 'SaveGame', 
                                                          function($scope, $location, $modal, Campaign, Player, Robot, InfoOpener, SaveGame) {
	
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
            Campaign.setLoadedScenario(result)
            if ($scope.scenario.levelup) {
                
                $modal.open({
                    templateUrl: './partials/levelup.html',
                    controller: 'LevelController'
                })
            }
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

angular.module('Tribetron').controller('LevelController', ['$scope', '$modalInstance', 'Player', 'Abilities', function($scope, $modalInstance, Player, Abilities) {
	
    var gamer = Player.getPlayer()
    var healthBefore = gamer.avatar.type.maxHealth
    var damageBefore = gamer.avatar.type.meleeDamage
    var tacticsBefore = gamer.tactics
    
    gamer.levelUp()
    
    $scope.avatarHealthBonus = gamer.avatar.type.maxHealth - healthBefore
    $scope.avatarDamageBonus = gamer.avatar.type.meleeDamage - damageBefore
    $scope.tacticsGained = gamer.tactics && !tacticsBefore
    $scope.player = gamer
    $scope.newAbilities = Abilities.getAbilitiesByLevel($scope.player.level)
    
	$scope.ok = function() {
		$modalInstance.dismiss('ok')
	}
}])